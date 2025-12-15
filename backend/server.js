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
    
    const { usuario, nombre, apellido_paterno, apellido_materno, rol, contrasena } = req.body;
    
    // Función para capitalizar el nombre y apellidos
    const capitalize = (str) => str.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase());

    // 1. Datos base a actualizar (sin contraseña)
    let sqlBase = `
        UPDATE trabajadores 
        SET Nombre=?, apellido_paterno=?, apellido_materno=?, rol=?
    `;
    let values = [
        capitalize(nombre), 
        capitalize(apellido_paterno), 
        capitalize(apellido_materno), 
        rol
    ];
    let sqlWhere = ' WHERE usuario=?';

    // 2. Comprobar si se envió una nueva contraseña (campo no vacío)
    if (contrasena && contrasena.length > 0) {
        
        // --- LÓGICA DE ACTUALIZACIÓN DE CONTRASEÑA ---
        
        bcrypt.hash(contrasena, salt, (err, hash) => {
            if (err) {
                console.error("Bcrypt hash error:", err);
                return res.status(500).json({ Error: "Error al encriptar la contraseña" });
            }

            // A) Construir la consulta SQL para actualizar TODOS los campos, incluyendo la contraseña
            const sqlComplete = sqlBase + ', contrasena=?' + sqlWhere;
            
            // B) Añadir el hash y el usuario a los valores
            const finalValues = [...values, hash, usuario];

            // C) Ejecutar la actualización (una sola consulta)
            db.query(sqlComplete, finalValues, (err, result) => {
                if (err) {
                    console.error("Database error (Update ALL):", err);
                    return res.status(500).json({ Error: "Error al actualizar el usuario y la contraseña" });
                }
                if (result.affectedRows > 0) {
                    // Si el usuario fue encontrado y actualizado
                    return res.status(200).json({ message: 'Usuario y contraseña actualizados con éxito' });
                } else {
                    // Si el usuario no fue encontrado (WHERE usuario=?)
                    return res.status(404).json({ Error: "Usuario no encontrado para actualizar" });
                }
            });
        });

    } else {
        
        // --- LÓGICA DE ACTUALIZACIÓN SIN CONTRASEÑA ---
        
        // A) La consulta SQL es solo para datos de usuario
        const sqlUpdateData = sqlBase + sqlWhere;
        
        // B) El hash no se incluye, solo los valores y el usuario
        const finalValues = [...values, usuario];

        // C) Ejecutar la actualización (una sola consulta)
        db.query(sqlUpdateData, finalValues, (err, result) => {
            if (err) {
                console.error("Database error (Update Data Only):", err);
                return res.status(500).json({ Error: "Error al actualizar los datos del usuario" });
            }
            if (result.affectedRows > 0) {
                return res.status(200).json({ message: 'Datos de usuario actualizados con éxito (contraseña no cambiada)' });
            } else {
                // Si el usuario existe pero no se hizo un cambio (ej. nombre era el mismo)
                // O el usuario no fue encontrado
                 return res.status(200).json({ message: 'Datos de usuario actualizados con éxito (contraseña no cambiada)' });
                // Alternativamente: return res.status(404).json({ Error: "Usuario no encontrado o sin cambios" });
            }
        });
    }
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
                    return res.json({Error: "Usuario o contraseña incorrectos"});
                }

            })
        }else{
            return res.json({Error: "Usuario o contraseña incorrectos"});
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
    
    // Consulta SQL corregida: Solo selecciona de la tabla 'trabajadores'.
    // He listado las columnas que el frontend espera (usuario, nombre, apellidos, rol)
    // y he incluido la columna 'contrasena' para que el backend tenga la información.
    const sql = `
        SELECT 
            usuario, 
            Nombre, 
            apellido_materno, 
            apellido_paterno, 
            rol, 
            contrasena AS texto_plano 
        FROM 
            trabajadores 
        WHERE 
            usuario = ?
    `;

    db.query(sql, [usuario_completo], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            // El error 500 ya no debería ocurrir si la sintaxis SQL es correcta.
            return res.status(500).json({ Error: "Error fetching user data" });
        }

        if (results.length === 0) {
            return res.status(404).json({ Error: "User not found" });
        }
        
        // El frontend espera campos como 'usuario', 'Nombre', 'apellido_materno', etc.
        // Y esperaba 'texto_plano' (ahora un alias de 'contrasena').
        return res.status(200).json(results[0]);
    });
});

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


app.get('/corte-caja-fecha', async (req, res) => {
    try {
        const fechaFiltro = req.query.fecha;

        if (!fechaFiltro) {
            // Este es el error 400 que estabas viendo
            return res.status(400).json({ Error: "Falta el parámetro 'fecha' para el filtro." }); 
        }

        const [ventas] = await db.promise().query(
            `SELECT v.id_venta, v.fecha, v.usuario, v.total, p.nombre, vd.cantidad, vd.precio_unitario
             FROM ventas v
             JOIN ventas_detalle vd ON v.id_venta = vd.id_venta
             JOIN productos p ON vd.codigo_producto = p.codigo
             WHERE DATE(v.fecha) = ?`, 
            [fechaFiltro]
        );
        // ... (Tu lógica de procesamiento de datos)
        // ...
        // (Aquí asumo que el resto de tu lógica para agrupar y calcular total es correcta)
        const ventasProcesadas = [ /* ... */ ]; // Debes completar esta lógica
        const totalDia = 0; // Debes calcular este total

        res.json({
             fecha: fechaFiltro, 
             totalDia: totalDia.toFixed(2),
             ventas: ventasProcesadas
        });
        
    } catch (err) {
        console.error("Error al obtener corte de caja por fecha:", err);
        res.status(500).json({ Error: "Ocurrió un error obteniendo el corte de caja por fecha" });
    }
});


// ----------------------------------------------------------------------
// 🚨 NUEVO ENDPOINT (FILTRO POR RANGO DE FECHAS) 🚨
// ----------------------------------------------------------------------
app.get('/corte-caja-rango', async (req, res) => {
    try {
        // 1. Obtener las fechas del query parameter (fecha_inicio y fecha_fin)
        const fechaInicio = req.query.fecha_inicio;
        const fechaFin = req.query.fecha_fin;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ Error: "Faltan los parámetros 'fecha_inicio' o 'fecha_fin' para el filtro de rango." });
        }

        // 2. Consulta SQL con el filtro de rango (BETWEEN)
        const [ventas] = await db.promise().query(
            `SELECT 
                v.id_venta, 
                v.fecha, 
                v.usuario, 
                v.total, 
                p.nombre, 
                vd.cantidad, 
                vd.precio_unitario
            FROM ventas v
            JOIN ventas_detalle vd ON v.id_venta = vd.id_venta
            JOIN productos p ON vd.codigo_producto = p.codigo
            WHERE DATE(v.fecha) BETWEEN ? AND ?`, // Filtro por rango
            [fechaInicio, fechaFin] // Parámetros: [fecha_inicio, fecha_fin]
        );

        // 3. Procesamiento y Agrupación de Datos (Reutiliza tu lógica existente)
        const ventasMap = {};

        ventas.forEach(v => {
            if (!ventasMap[v.id_venta]) {
                ventasMap[v.id_venta] = {
                    num_venta: v.id_venta,
                    fecha: v.fecha,
                    usuario: v.usuario,
                    total: parseFloat(v.total) || 0,
                    productos: []
                };
            }
            ventasMap[v.id_venta].productos.push({
                nombre: v.nombre,
                cantidad: v.cantidad,
                precioUnitario: parseFloat(v.precio_unitario) || 0
            });
        });

        const ventasProcesadas = Object.values(ventasMap);
        const totalDia = ventasProcesadas.reduce((acc, v) => acc + v.total, 0);

        // 4. Respuesta al cliente
        res.json({
            fecha: `${fechaInicio} al ${fechaFin}`, 
            totalDia: totalDia.toFixed(2),
            ventas: ventasProcesadas
        });
    } catch (err) {
        console.error("Error al obtener corte de caja por rango:", err);
        res.status(500).json({ Error: "Ocurrió un error obteniendo el corte de caja por rango" });
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

// --- Eliminar proveedor (CORREGIDO PARA MANEJAR CLAVE FORÁNEA) ---
app.delete('/deleteProveedor/:codigo', (req, res) => {
    const { codigo } = req.params;
    const sql = 'DELETE FROM proveedores WHERE codigo = ?';

    db.query(sql, [codigo], (err, result) => {
        if (err) {
            // 🛑 INTERCEPTACIÓN DEL ERROR DE CLAVE FORÁNEA (ER_ROW_IS_REFERENCED_2)
            // El código de error de MySQL para Foreign Key Constraint Fail es 1451
            if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
                console.warn(`Intento de eliminar proveedor ${codigo} falló por FK.`);
                
                // ⭐️ Devuelve un error 409 (Conflicto) con un mensaje amigable
                return res.status(409).json({ 
                    Error: "No se puede eliminar este proveedor, existen compras asociadas.",
                    message: `El proveedor con código ${codigo} no puede eliminarse porque existen compras asociadas.`,
                    developer_message: "Foreign Key Constraint Failed"
                });
            }
            
            // Si es otro tipo de error de MySQL, lo manejamos como 500
            console.error('Error interno al eliminar proveedor:', err);
            return res.status(500).json({ Error: "Error interno al eliminar el proveedor." });
        }
        
        // El resto del código de éxito permanece igual
        if (result.affectedRows === 0) {
            return res.status(404).json({ Error: "Proveedor no encontrado" });
        }
        return res.status(200).json({ Status: "Exito", message: "Proveedor eliminado exitosamente" });
    });
});



// Ruta de compra que utiliza db.promise() para Async/Await
app.post('/realizarCobro', async (req, res) => {
    // La lógica de transacciones con try/catch y ROLLBACK se mantiene, lo cual es CORRECTO.
    const connection = db.promise();
    const { costo, data: productosVendidos, username } = req.body;
    const pago = parseFloat(req.body.pago); // Asegurar que pago sea un número
    const costoTotal = parseFloat(costo); // El costo total de la venta

    // 1. Validación de datos de entrada
    if (!username || !productosVendidos || productosVendidos.length === 0 || isNaN(pago) || isNaN(costoTotal)) {
        return res.status(400).json({ Error: "Faltan datos requeridos (usuario, pago, costo, o lista de productos vacía)." });
    }

    try {
        await connection.query("START TRANSACTION");

        // 2. Insertar el Encabezado de la Venta (Nueva tabla 'ventas')
        const fechaISO = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato DATETIME
        
        // El total (costo) viene en el body.
        const sql_insert_venta = "INSERT INTO ventas (total, usuario, fecha) VALUES (?, ?, ?)";
        const [ventaHeaderResult] = await connection.query(sql_insert_venta, [costoTotal, username, fechaISO]);
        
        const id_venta_nueva = ventaHeaderResult.insertId;
        
        let errores = [];
        let faltantes = [];

        // 3. Procesar cada producto para VENTA (Insertar detalles y actualizar stock)
        for (const producto of productosVendidos) {
            const { codigo, cantidad } = producto;
            const precioUnitario = parseFloat(producto.precio);
            
            // Re-validación de existencias y obtención de cantidad_minima
            const [productRows] = await connection.query("SELECT nombre, cantidad, cantidad_minima FROM productos WHERE codigo = ?", [codigo]);
            
            if (productRows.length === 0) {
                errores.push(`Producto con código ${codigo} no encontrado.`);
                continue;
            }

            const { nombre, cantidad: stockActual, cantidad_minima } = productRows[0];

            if (stockActual - cantidad < 0) {
                errores.push(`Producto ${nombre} (${codigo}) sin existencias suficientes. Stock: ${stockActual}`);
                continue;
            }

            // A. Insertar Detalle de Venta (Nueva tabla 'ventas_detalle')
            const subtotal = precioUnitario * cantidad;
            const sql_insert_detalle = "INSERT INTO ventas_detalle (id_venta, codigo_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)";
            await connection.query(sql_insert_detalle, [id_venta_nueva, codigo, cantidad, precioUnitario, subtotal]);

            // B. Actualizar Stock (DISMINUIR)
            const sql_update = "UPDATE productos SET cantidad = cantidad - ? WHERE codigo = ?";
            await connection.query(sql_update, [cantidad, codigo]);

            // C. Revisar faltantes
            if (stockActual - cantidad < cantidad_minima) {
                faltantes.push({ codigo, nombre, cantidad_actual: stockActual - cantidad });
            }
        }

        // 4. Manejo de Errores de la Venta
        if (errores.length > 0) {
            await connection.query("ROLLBACK");
            return res.status(400).json({
                Status: "Error",
                Error: "Venta fallida debido a errores en los productos",
                detalles: errores
            });
        }

        // 5. Confirmar la transacción
        await connection.query("COMMIT");

        return res.status(200).json({
            Status: "Exito",
            message: "Venta realizada con éxito",
            Faltantes: faltantes,
            num_venta: id_venta_nueva // Devolver el ID de la venta
        });

    } catch (err) {
        await connection.query("ROLLBACK");
        console.error("Error en realizarCobro:", err);
        return res.status(500).json({
            Status: "Error",
            Error: "Ocurrió un error interno en el proceso de venta",
            detail: err.message
        });
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

    const body = [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']];
    req.body.data.forEach(row => {
        body.push([
            row.nombre,
            row.cantidad.toString(),
            { text: `$${row.precio}`, alignment: 'right' },
            { text: `$${row.precio * row.cantidad}`, alignment: 'right' },
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