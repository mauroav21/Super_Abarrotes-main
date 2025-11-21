/**
 * Super Abarrotes Backend - server.js
 * -----------------------------------
 * Este archivo implementa el servidor backend para el sistema "Super Abarrotes".
 * Utiliza Express.js, MySQL, JWT, bcrypt y pdfmake para gestionar usuarios, productos, ventas y generación de reportes PDF.
 *
 * Funcionalidades principales:
 * - Registro, autenticación y actualización de usuarios (con roles y contraseñas encriptadas).
 * - CRUD de productos (insertar, modificar, eliminar, consultar).
 * - Gestión de ventas y actualización de inventario.
 * - Generación de reportes PDF (faltantes y tickets de venta).
 * - Middleware de autenticación con JWT.
 * - Manejo de CORS y cookies.
 *
 * Rutas principales:
 * - POST    /register_user          : Registrar un nuevo usuario.
 * - POST    /update_user            : Actualizar datos de usuario.
 * - POST    /login                  : Autenticación de usuario.
 * - GET     /logout                 : Cerrar sesión (elimina cookie JWT).
 * - GET     /                       : Verifica autenticación y devuelve datos del usuario.
 * - GET     /data                   : Obtiene todos los productos.
 * - GET     /dataPventa             : Obtiene productos con existencia > 0.
 * - GET     /dataFaltantes          : Obtiene productos con cantidad menor a la mínima.
 * - GET     /data_usuarios          : Lista usuarios y contraseñas (texto plano y encriptada).
 * - GET     /GetProducto/:codigo    : Obtiene un producto por código.
 * - POST    /insertarProducto       : Inserta un nuevo producto.
 * - POST    /modificarProducto      : Modifica un producto existente.
 * - DELETE  /deleteProducto/:codigo : Elimina un producto por código.
 * - DELETE  /deleteUsuario/:usuario : Elimina un usuario por nombre de usuario.
 * - GET     /GetUser                : Obtiene datos del usuario autenticado.
 * - GET     /GetUserData/:user      : Obtiene datos completos de un usuario.
 * - POST    /realizarCobro          : Registra una venta y actualiza inventario.
 * - GET     /generar-pdf            : Genera PDF de productos faltantes.
 * - POST    /imprimir-ticket        : Genera PDF de ticket de venta.
 *
 * Dependencias:
 * - express, mysql2, cors, jsonwebtoken, bcrypt, cookie-parser, pdfkit, pdfmake, fs, path
 *
 * Notas de seguridad:
 * - Las contraseñas se almacenan encriptadas, pero también en texto plano (solo para propósitos de recuperación, no recomendado en producción).
 * - JWT se usa para autenticación y autorización de rutas protegidas.
 * - El servidor escucha en el puerto 8081.
 *
 * Autor: Equipo Super Abarrotes
 * Fecha: 2025
 */
import express from 'express';
import mysql2 from 'mysql2';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt, { compareSync } from 'bcrypt';
import cookieParser from 'cookie-parser';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import PdfPrinter from "pdfmake";
const salt = 10;
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "DELETE", "OPTIONS"],
    credentials: true
}));
app.use(cookieParser());

// 🛠️ CONFIGURACIÓN DEL POOL DE CONEXIONES
const db = mysql2.createPool({ 
    host: "localhost",
    user: "root",
    //password: "superAbarrotes", // Descomenta si usas contraseña
    database: "superabarrotes",
    waitForConnections: true,
    connectionLimit: 10,  // Número de conexiones concurrentes
    queueLimit: 0
});
console.log('Pool de conexiones a la base de datos configurado.');

// 🛠️ CORRECCIÓN: Se elimina db.connect() porque los Pools (createPool) 
// no tienen ni necesitan este método. El Pool se inicializa automáticamente.
/*
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database as ID ' + db.threadId);
});
*/

app.post('/register_user', (req, res) => {
    const sql = "INSERT INTO trabajadores(`nombre`,`apellido_paterno`,`apellido_materno`,`usuario`,`contrasena`,`rol`) VALUES (?)";
    const sql_select = "SELECT * from trabajadores where usuario=?";
    const sql_password = "INSERT INTO contrasena(`encriptada`,`texto_plano`) VALUES (?,?)";
    const values = [req.body.usuario.toLowerCase()];
    db.query(sql_select, values, (err, data) => {
        if(err) return res.json({Error: "Error al buscar el usuario"});
        if(data.length>0){
            return res.json({Error: "El USUARIO ya está REGISTRADO"})
        }
        bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
            if(err)return res.json({Error: "Error al encriptar la contraseña"});
            const values = [req.body.nombre.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()), 
                req.body.apellido_paterno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()), 
                req.body.apellido_materno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()), 
                req.body.usuario.toLowerCase(), hash, req.body.rol];
            db.query(sql, [values], (err, result) => {
                if(err) return res.json({Error: "Error al registrar el usuario"});
                db.query(sql_password, [hash, req.body.contrasena], (err, result) => {
                    if(err) return res.json({Error: "Error al registrar la contraseña"});
                    if(result.affectedRows > 0){
                        return res.status(200).json({ message: 'Usuario registrado exitosamente' });
                    }else{
                        console.log(err);
                    }
                })
            })
        })
    }
    )
})


app.post('/update_user', (req, res) => {
    const sql = "UPDATE trabajadores SET nombre=?, apellido_paterno=?, apellido_materno=?, contrasena=?, rol=? WHERE usuario=?";
    const password_replace = "UPDATE  contrasena SET encriptada=?, texto_plano=? WHERE encriptada=(SELECT contrasena from trabajadores WHERE usuario=?)";
    bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
        if(err)return res.json({Error: "Error al encriptar la contraseña"});
        const values = [req.body.nombre.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()), 
            req.body.apellido_paterno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()), 
            req.body.apellido_materno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()), 
            hash,req.body.rol, req.body.usuario];
        db.query(password_replace,[hash,req.body.contrasena,req.body.usuario] , (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ Error: "Error updating user data" });
            }
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ Error: "Error updating password" });
                }
                if (result.affectedRows > 0) {
                    return res.status(200).json({ message: 'User updated successfully' });
                } else {
                    console.log("No user updated");
                }
            });
        });
        })
});

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM trabajadores WHERE usuario = ?";
    db.query(sql, [req.body.username], (err, data) => {
        if(err) return res.json({Error: "Error al buscar el usuario"});
        if(data.length>0){
            bcrypt.compare(req.body.password.toString(), data[0].contrasena, (err, response) => {
                if(err) return res.json({Error: "Error al comparar la contrseña"});
                if(response){
                    const name = data[0].usuario;
                    const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: '1d'}, {path: "/"});
                    res.cookie('token', token);
                    return res.json({Status: "Exito"});
                } else{
                    return res.json({Error: "Contraseña incorrecta"});
                }

            })
        }else{
            return res.json({Error: "Usuario no registrado"});
        }
    })
})

app.post('/insertarProducto',(req, res) => {
    const sql = "INSERT INTO productos(codigo,nombre,precio,cantidad,cantidad_minima) VALUES(?,?,?,?,?)";
    const sql_select_codigo = "SELECT * from productos where codigo=?";
    const sql_select_nombre = "SELECT * from productos where nombre=?";
    
    const num_values = [Number(req.body.codigo), Number(req.body.cantidad), Number(req.body.cantidad_minima), Number(req.body.precio)];
    const values = [req.body.codigo,req.body.nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),req.body.precio,req.body.cantidad, req.body.cantidad_minima];
    db.query(sql_select_codigo, [req.body.codigo], (err,data) => {
        console.log(data.sql);
        if(data.length>0){
            return res.json({Error: "El CÓDIGO del producto YA está REGISTRADO"})
        }else{
            db.query(sql_select_nombre, [req.body.nombre], (err, data) => {
                if(data.length>0){
                    console.log(data.sql);
                    return res.json({Error: "El NOMBRE del producto YA está REGISTRADO"});
                }else{
                    if(Number.isInteger(num_values[0]) && Number.isInteger(num_values[1]) && Number.isInteger(num_values[2])){
                        db.query(sql, values, (err,data) => {
                            if(err) return res.json({Error: "Ha habido un error al insertar el producto"});
                            return res.json({Status: "Exito"});
                        })
                    }else{
                        return res.json({Error: "Por favor, ingrese cantidades ENTERAS"});
                    }
                }
            })
        }
    })
})

app.post('/modificarProducto',(req, res) => {
    const sql =" UPDATE productos set nombre=?, precio = ? , cantidad = ? , cantidad_minima = ? WHERE codigo = ?";
    const sql_select_codigo = "SELECT * from productos where codigo=?";
    const sql_select_nombre = "SELECT * from productos where nombre=?";
    const num_values = [Number(req.body.codigo), Number(req.body.cantidad), Number(req.body.cantidad_minima), Number(req.body.precio)];
    const values = [req.body.nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),req.body.precio,req.body.cantidad, req.body.cantidad_minima, req.body.codigo];
    db.query(sql_select_codigo, [req.body.codigo], (err,data) => {
        console.log(data.sql);
        if(data.length>1){
            return res.json({Error: "El CÓDIGO del producto YA está REGISTRADO"})
        }else{
            const nombre_original = data[0].nombre;
            db.query(sql_select_nombre, [req.body.nombre], (err, data) => {
                if(data.length>0 && nombre_original != req.body.nombre){
                    console.log(data.sql);
                    return res.json({Error: "El NOMBRE del producto YA está REGISTRADO"});
                }else{
                    if(Number.isInteger(num_values[0]) && Number.isInteger(num_values[1]) && Number.isInteger(num_values[2])){
                        db.query(sql, values, (err,data) => {
                            if(err) return res.json({Error: "Ha habido un error al insertar el producto"});
                            return res.json({Status: "Exito"});
                        })
                    }else{
                        return res.json({Error: "Por favor, ingrese cantidades ENTERAS"});
                    }
                }
            })
        }
    })
})


const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.json({Error: "No estás autenticado"});
    }else{
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) return res.json({Error: "Token inválido"});
            req.name = decoded.name;
            const sql_select = "SELECT * from trabajadores where usuario=?";
            db.query(sql_select, [req.name], (err, data) => {
                if(err) return res.json({Error: "Error al buscar el usuario"});
                if(data.length>0){
                    req.rol = data[0].rol;
                    next();
                }else{
                    return res.json({Error: "Usuario no registrado"});
                }
            })
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({Status: "Exito", name: req.name, rol: req.rol});
})


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Exito"});
})

app.get('/data', (req, res) => {
    db.query('SELECT * FROM PRODUCTOS', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results); 
    });
  });

  app.get('/dataPventa', (req, res) => {
    db.query('SELECT * FROM PRODUCTOS WHERE cantidad > 0', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results); 
    });
  });

  app.get('/dataFaltantes', (req, res) => {
    const sql = 'SELECT * FROM productos WHERE cantidad < cantidad_minima';
    db.query(sql, (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results); 
    });
  });

app.get('/data_usuarios', (req, res) => {
    const sql = `
        SELECT usuario, contrasena, rol, nombre, apellido_paterno, apellido_materno 
        FROM trabajadores
    `;

    db.query(sql, (error, results) => {
        if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
        }
        res.json(results); // Devuelve un array de usuarios
    });
});


app.get('/GetProducto/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const sql = 'SELECT * FROM productos WHERE codigo = ?';

    db.query(sql, [codigo], (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Error al buscar el producto" });
        }
        if (result.length > 0) {
            return res.status(200).json({ Status: "Exito", Producto: result[0] });
        } else {
            res.status(404).json({ error: 'No se encontró el producto' });
        }
    });
});

  app.delete('/deleteProducto/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const sql = 'DELETE FROM productos WHERE codigo = ?';

    db.query(sql, [codigo], (err, result) => { 
        if (err) {
            return res.status(500).json({ Error: "Error al eliminar el producto" }); 
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Se eliminó el producto éxitosamente' });
        } else {
            res.status(404).json({ error: 'No se encontró el producto' });
        }
    });
});

app.delete('/deleteUsuario/:usuario', (req, res) => {
    const usuario = req.params.usuario;
    const sql = 'DELETE FROM trabajadores WHERE usuario = ?';

    db.query(sql, [usuario], (err, result) => { 
        if (err) {
            return res.status(500).json({ Error: "Error al eliminar el usuario" }); 
        }
        if (result.affectedRows > 0) {
            res.json({ message: 'Se eliminó el usuario éxitosamente' });
        } else {
            res.status(404).json({ error: 'No se encontró el usuario' });
        }
    });
});

app.get('/GetUser', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ Error: "No token provided" });
    }

    try {
        const tokenDecoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const username = tokenDecoded.name;

        if (!username) {
          return res.status(400).json({ Error: "Username not found in token" });
        }

        const sql = 'SELECT usuario, nombre, apellido_paterno, rol FROM trabajadores WHERE usuario = ?';

        db.query(sql, [username], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ Error: "Error fetching user data" });
            }

            if (results.length === 0) {
                return res.status(404).json({ Error: "User not found" });
            }

            const user = results[0];
            const fullName = user.nombre.split(" ");
            const firstName = fullName[0];
            const lastName = user.apellido_paterno;
            const name = firstName + " " + lastName;
            const rol = user.rol;
            const username = user.usuario;
            return res.json({ name,rol, username});
        });

    } catch (error) {
        console.error("Token decoding error:", error);
        return res.status(400).json({ Error: "Invalid token format" });
    }
})

app.get('/GetUserData/:user', (req, res) => {  
    const usuario_completo = req.params.user;
    const sql = 'SELECT * from trabajadores, contrasena WHERE contrasena=encriptada AND usuario = ?';

    db.query(sql, [usuario_completo], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ Error: "Error fetching user data" });
        }

        if (results.length === 0) {
            return res.status(404).json({ Error: "User not found" });
        }
        return res.status(200).json(results[0]);
    });
})

//Compras

/* ========== GET proveedores ========== */
app.get('/api/proveedores', (req, res) => {
  const sql = 'SELECT codigo, nombre, telefono, correo FROM proveedores';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener proveedores' });
    }
    res.json(results);
  });
});

/* ========== GET productos ========== */
app.get('/api/productos', (req, res) => {
  // Traemos codigo, nombre, precio y cantidad (existencias)
  const sql = 'SELECT codigo, nombre, precio, cantidad FROM productos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(results);
  });
});

// Ruta de compras que utiliza db.getConnection()
app.post('/api/compras', (req, res) => {
  const { codigo_proveedor, total, detalles } = req.body;
  if (!codigo_proveedor || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  db.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.beginTransaction(txErr => {
      if (txErr) {
        conn.release();
        console.error(txErr);
        return res.status(500).json({ error: 'Error al iniciar transacción' });
      }

      const insertCompraSql = 'INSERT INTO compras (codigo, total) VALUES (?, ?)';
      conn.query(insertCompraSql, [codigo_proveedor, total], (err, result) => {
        if (err) {
          return conn.rollback(() => {
            conn.release();
            console.error(err);
            res.status(500).json({ error: 'Error al insertar compra' });
          });
        }

        const idCompra = result.insertId;

        // Prepara valores para inserción en compras_detalle
        const valoresDetalle = detalles.map(d => [
          idCompra,
          d.codigo, 				// codigo del producto (productos.codigo)
          d.cantidad,
          d.precio_unitario,
          d.subtotal
        ]);

        const insertDetalleSql = 'INSERT INTO compras_detalle (id_compra, codigo, cantidad, precio_unitario, subtotal) VALUES ?';
        conn.query(insertDetalleSql, [valoresDetalle], (err) => {
          if (err) {
            return conn.rollback(() => {
              conn.release();
              console.error(err);
              res.status(500).json({ error: 'Error al insertar detalles' });
            });
          }

          // Actualizar existencia (productos.cantidad) uno por uno
          const actualizarExistencia = (i) => {
            if (i >= detalles.length) {
              // commit
              return conn.commit(commitErr => {
                if (commitErr) {
                  return conn.rollback(() => {
                    conn.release();
                    console.error(commitErr);
                    res.status(500).json({ error: 'Error al confirmar transacción' });
                  });
                }
                conn.release();
                return res.json({ ok: true, id_compra: idCompra });
              });
            }

            const d = detalles[i];
            const sqlUpd = 'UPDATE productos SET cantidad = cantidad + ? WHERE codigo = ?';
            conn.query(sqlUpd, [d.cantidad, d.codigo], (err) => {
              if (err) {
                return conn.rollback(() => {
                  conn.release();
                  console.error(err);
                  res.status(500).json({ error: 'Error al actualizar existencia' });
                });
              }
              actualizarExistencia(i + 1);
            });
          };

          actualizarExistencia(0);
        });
      });
    });
  });
});


// CORTE DE CAJA con detalle de productos
app.get('/corte-caja-dia', async (req, res) => {
  try {
    // db.promise() funciona con el Pool
    const [ventas] = await db.promise().query(
      `SELECT v.num_venta, v.fecha, v.usuario, v.total, p.nombre, v.cantidad, v.total/v.cantidad AS precioUnitario
        FROM ventas v
        JOIN productos p ON v.producto = p.codigo
        WHERE DATE(v.fecha) = CURDATE()`
    );

    const ventasMap = {};

    ventas.forEach(v => {
      if (!ventasMap[v.num_venta]) {
        ventasMap[v.num_venta] = {
          num_venta: v.num_venta,
          fecha: v.fecha,
          usuario: v.usuario,
          total: parseFloat(v.total) || 0,
          productos: []
        };
      }
      ventasMap[v.num_venta].productos.push({
        nombre: v.nombre,
        cantidad: v.cantidad,
        precioUnitario: parseFloat(v.precioUnitario) || 0
      });
    });

    const ventasProcesadas = Object.values(ventasMap);

    const totalDia = ventasProcesadas.reduce((acc, v) => acc + v.total, 0);

    res.json({
      fecha: new Date().toISOString().slice(0,10),
      totalDia,
      ventas: ventasProcesadas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Ocurrió un error obteniendo el corte de caja" });
  }
});




// ================================================
// ================ PROVEEDORES ===================
// ================================================

// --- Obtener todos los proveedores ---
app.get('/data_proveedores', (req, res) => {
    const sql = 'SELECT codigo, nombre, telefono, correo FROM proveedores ORDER BY nombre ASC';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener proveedores:', error);
            return res.status(500).json({ Error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// --- Obtener un proveedor por código ---
app.get('/GetProveedor/:codigo', (req, res) => {
    const { codigo } = req.params;
    const sql = 'SELECT * FROM proveedores WHERE codigo = ?';
    db.query(sql, [codigo], (err, result) => {
        if (err) {
            console.error('Error al buscar el proveedor:', err);
            return res.status(500).json({ Error: 'Error al buscar el proveedor' });
        }
        if (result.length === 0) {
            return res.status(404).json({ Error: 'Proveedor no encontrado' });
        }
        return res.status(200).json({ Status: 'Exito', Proveedor: result[0] });
    });
});

// --- Insertar un nuevo proveedor ---
app.post('/insertarProveedor', (req, res) => {
    const { codigo, nombre, telefono, correo } = req.body;

    if (!codigo || !nombre) {
        return res.status(400).json({ Error: "Faltan campos obligatorios (código o nombre)." });
    }

    const nombre_normalizado = nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    const sql_check = "SELECT * FROM proveedores WHERE codigo = ? OR nombre = ?";
    const sql_insert = "INSERT INTO proveedores (codigo, nombre, telefono, correo) VALUES (?, ?, ?, ?)";
    
    db.query(sql_check, [codigo, nombre_normalizado], (err, data) => {
        if (err) {
            console.error('Error al verificar duplicado:', err);
            return res.status(500).json({ Error: "Error al verificar el proveedor" });
        }

        if (data.length > 0) {
            return res.status(409).json({ Error: "El código o nombre del proveedor ya está registrado" });
        }

        db.query(sql_insert, [codigo, nombre_normalizado, telefono, correo], (err, result) => {
            if (err) {
                console.error('Error al insertar proveedor:', err);
                return res.status(500).json({ Error: "Error al insertar el proveedor" });
            }
            return res.status(200).json({
                Status: "Exito",
                message: "Proveedor registrado exitosamente",
                id_proveedor: result.insertId
            });
        });
    });
});

// --- Modificar proveedor ---
app.post('/modificarProveedor', (req, res) => {
    const { codigo, nombre, telefono, correo } = req.body;

    if (!codigo) {
        return res.status(400).json({ Error: "El código del proveedor es obligatorio para modificar." });
    }

    const nombre_normalizado = nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    const sql_update = "UPDATE proveedores SET nombre = ?, telefono = ?, correo = ? WHERE codigo = ?";

    db.query(sql_update, [nombre_normalizado, telefono, correo, codigo], (err, result) => {
        if (err) {
            console.error('Error al modificar proveedor:', err);
            return res.status(500).json({ Error: "Error al modificar el proveedor" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ Error: "Proveedor no encontrado" });
        }
        return res.status(200).json({ Status: "Exito", message: "Proveedor actualizado exitosamente" });
    });
});

// --- Eliminar proveedor ---
app.delete('/deleteProveedor/:codigo', (req, res) => {
    const { codigo } = req.params;
    const sql = 'DELETE FROM proveedores WHERE codigo = ?';

    db.query(sql, [codigo], (err, result) => {
        if (err) {
            console.error('Error al eliminar proveedor:', err);
            return res.status(500).json({ Error: "Error al eliminar el proveedor" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ Error: "Proveedor no encontrado" });
        }
        return res.status(200).json({ Status: "Exito", message: "Proveedor eliminado exitosamente" });
    });
});


// ================================================
// ================== COMPRAS =====================
// ================================================

// Ruta de compra que utiliza db.promise() para Async/Await
app.post('/realizarCompra', async (req, res) => {
    // db.promise() obtiene un pool de promesas que gestiona las conexiones internamente
    const connection = db.promise();

    try {
        const { id_proveedor, usuario, total, productos_comprados } = req.body;

        // Validación básica
        if (!id_proveedor || !usuario || !total || !productos_comprados || productos_comprados.length === 0) {
            return res.status(400).json({ Error: "Faltan datos requeridos o la lista de productos está vacía." });
        }

        // Iniciar transacción
        await connection.query("START TRANSACTION");

        // Insertar registro principal en compras
        const [compraResult] = await connection.query(
            "INSERT INTO compras(fecha, total, id_proveedor, usuario) VALUES(CURDATE(), ?, ?, ?)",
            [total, id_proveedor, usuario]
        );
        const id_compra = compraResult.insertId;

        // Iterar productos para detalle y actualizar inventario
        for (const producto of productos_comprados) {
            const { codigo, cantidad, precio_compra, subtotal } = producto;

            if (!codigo || !cantidad || !precio_compra || !subtotal) {
                throw new Error(`Datos incompletos para el producto con código ${codigo}`);
            }

            // Insertar detalle de compra
            await connection.query(
                "INSERT INTO detalle_compras(id_compra, producto, cantidad, precio_compra, subtotal) VALUES(?, ?, ?, ?, ?)",
                [id_compra, codigo, cantidad, precio_compra, subtotal]
            );

            // Actualizar inventario
            await connection.query(
                "UPDATE productos SET cantidad = cantidad + ? WHERE codigo = ?",
                [cantidad, codigo]
            );
        }

        // Confirmar transacción
        await connection.query("COMMIT");

        return res.status(200).json({
            Status: "Exito",
            message: "Compra registrada y inventario actualizado con éxito",
            id_compra
        });

    } catch (err) {
        // Revertir cambios en caso de error
        await connection.query("ROLLBACK");
        console.error("Error en el proceso de compra:", err);
        return res.status(500).json({ Error: "Ocurrió un error en el proceso de compra.", detail: err.message });
    }
});





app.listen(8081, () => {
    console.log('Conectado al backend!');
})

app.get('/generar-pdf', (req, res) => {
    const fonts = {
        Roboto: {
            normal: 'fonts/JosefinSans-Regular.ttf',
            bold: 'fonts/JosefinSans-Medium.ttf',
            italics: 'fonts/JosefinSans-Italic.ttf',
            bolditalics: 'fonts/JosefinSans-MediumItalic.ttf'
        }
    };
    const body = [['Producto', 'Cantidad', 'Código', 'Precio', 'Cantidad Mínima']];
    db.query('SELECT * FROM productos WHERE cantidad < cantidad_minima ', (error, results, fields) => {
        if (error) {
          console.error('Database query error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        results.forEach(row => {
            body.push([
                row.nombre,
                row.cantidad.toString(),
                row.codigo,
                `$${row.precio}`,
                row.cantidad_minima.toString()
            ]);
        });
        var dd = {
            content: [
                {
                    image: './img/faltantes_header.png',
                    width: 530,
                    margin: [0, 0, 0, 20] //
                },
                {text: 'Lista de Faltantes', style: 'header', alignment: 'center', margin: [0, 0, 0, 40]},
                {
                    style: 'tableExample',
                    table: {
                        widths: [95, 95, 95, 95,95],
                        body
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                subheader: {
                    fontSize: 14,
                    bold: true
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                }
            }
        };
        var printer = new PdfPrinter(fonts);
        var pdfDoc = printer.createPdfKitDocument(dd);
        var pdfDoc = printer.createPdfKitDocument(dd);
        pdfDoc.pipe(fs.createWriteStream('lista_de_faltantes.pdf')).on('finish', () => {
            res.download('lista_de_faltantes.pdf', 'lista_de_faltantes.pdf', (err) => {
                if (err) {
                    console.error('Error downloading the file:', err);
                }
            });
        });
        pdfDoc.end();
        console.log('PDF generated and ready for download');
      });
})

app.delete('/deleteUser/:usuario', (req, res) => {
    const codigo = req.params.usuario;
    const sql = 'DELETE FROM trabajadores WHERE usuario = ?';

    db.query(sql, [codigo], (err, result) => { 
        if (err) {
            return res.status(500).json({ Error: "Error al eliminar el usuario" }); 
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Se eliminó el usuario éxitosamente' });
        } else {
            res.status(404).json({ error: 'No se encontró el usuario' });
        }
    });
});

app.post('/realizarCobro', async (req, res) => {
    try {
        const [ventaResult] = await db.promise().query("SELECT MAX(num_venta) FROM ventas;");
        let num_venta = ventaResult[0]["MAX(num_venta)"] ? parseInt(ventaResult[0]["MAX(num_venta)"]) + 1 : 1;

        const [fechaResult] = await db.promise().query("SELECT CURDATE()");
        const fecha_query = fechaResult[0]['CURDATE()'];
        const fecha_obj = new Date(fecha_query);
        const fechaISO = fecha_obj.toISOString().slice(0, 10);

        let faltantes = [];
        let error = "";

        await Promise.all(req.body.data.map(async (producto) => {
            const [productResult] = await db.promise().query("SELECT * FROM productos WHERE codigo = ?", [producto.codigo]);
            if (productResult.length > 0) {
                const cantidad_actual = productResult[0].cantidad;
                const cantidad_minima = productResult[0].cantidad_minima;
                if (cantidad_actual - producto.cantidad >= 0) {
                    const sql_insert = "INSERT INTO ventas(num_venta, producto, cantidad, total, fecha, usuario) VALUES(?,?,?,?,?,?)";
                    const subtotal = producto.precio * producto.cantidad;  // Calcula subtotal del producto
                    const valores = [num_venta, producto.codigo, producto.cantidad, subtotal, fechaISO, req.body.username];
                    await db.promise().query(sql_insert, valores);
        
                    const sql_update = "UPDATE productos SET cantidad = cantidad - ? WHERE codigo = ?";
                    await db.promise().query(sql_update, [producto.cantidad, producto.codigo]);

                    if (cantidad_actual - producto.cantidad < cantidad_minima) {
                        faltantes.push({
                            codigo: producto.codigo,
                            nombre: producto.nombre,
                            cantidad: cantidad_actual - producto.cantidad,
                        });
                    }
                }else{
                    error = `Producto ${producto.nombre} sin existencias`;
                }
            }else{
                return res.status(404).json({ Error: `Producto con código ${producto.codigo} no encontrado` });
            }
        }));
        if (error) {
            return res.json({ Error: error });
        }else{
            console.log(faltantes)
            return res.status(200).json({
                Status: "Exito",
                message: "Venta realizada con éxito",
                Faltantes: faltantes
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ Error: "Ocurrió un error en el proceso de venta" });
    }
});


app.get('/dataPventa', (req, res) => {
    db.query('SELECT * FROM PRODUCTOS WHERE cantidad>0', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results); 
    });
  });

  app.get('/dataPventa', (req, res) => {
    db.query('SELECT * FROM PRODUCTOS WHERE cantidad>0', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results); 
    });
  });


  app.post('/imprimir-ticket', (req, res) => {
    const fonts = {
        Roboto: {
            normal: path.join(__dirname, 'fonts', 'JosefinSans-Regular.ttf'),
            bold: path.join(__dirname, 'fonts', 'JosefinSans-Medium.ttf'),
            italics: path.join(__dirname, 'fonts', 'JosefinSans-Italic.ttf'),
            bolditalics: path.join(__dirname, 'fonts', 'JosefinSans-MediumItalic.ttf')
        }
    };

    const body = [['Producto', 'Cantidad', 'Precio', 'Subtotal']];
    req.body.data.forEach(row => {
        body.push([
            row.nombre,
            row.cantidad.toString(),
            `$${row.precio}`,
            `$${row.precio * row.cantidad}`,
        ]);
    });

    const dd = {
        content: [
            {
                image: path.join(__dirname, 'img', 'faltantes_header.png'),
                width: 530,
                margin: [0, 0, 0, 20]
            },
            { text: 'Ticket de venta', style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
            {
                style: 'tableExample',
                table: {
                    widths: ['*', '*', '*', '*'],
                    body
                }
            },
            { text: `Total: $${req.body.costo}`, style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
            { text: `Pagó: $${req.body.pago}`,style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
            { text: `Cambio: $${req.body.pago-req.body.costo}`, style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            }
        }
    };

    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(dd);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');

    pdfDoc.pipe(res);
    pdfDoc.end();
});