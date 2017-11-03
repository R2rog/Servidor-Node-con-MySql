//Modulos requeridos.
const http= require('http');
const fs=require('fs');
var express=require('express');
var bodyParser= require('body-parser');
var path= require('path');
var expressValidator=require('express-validator');//Valida las entradas de los formularios.
//var Sequelize = require('sequelize');Ayuda a la interacción entre la bd y el servidor.
var mysql= require('mysql');
const port=8080;//Puerto por el que se conecta el servidor.

//Estableciendo la conexión con MySql
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
	port: 8889,//Puerto del servidor de PHP my admin.
  database: 'prueba'
});
//Checando la conexión a la base de datos.
connection.connect(function(err) {
  if (err) {
    console.log('ocurrio un error');
    console.error('error connecting: ' + err.stack);
    return;
  }
  else{
    console.log('Conectado a la base de datos');
    console.log('connected as id ' + connection.threadId);
  }
});

//Objeto tipo express.
var app=express();

//View engine.
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Valores estáticos: CSS.
app.use(express.static(path.join(__dirname,'public')));

//Variables gloales.
app.use(function(req,res,next){
	res.locals.errors=null;
	next();
});
//Validador de los formularios en HTML.
app.use(expressValidator({
	errorFormater: function(param,msg,value){
		var namespace= param.split('.'),
		root= namespace.shift(),
		formParam=root;

		while(namespace.length){
			formParam+='['+namespace.shift()+']';
		}
		return {
			param :formParam,
			msg : msg,
			value : value
		};
	}
}));

//Crea la página principal.
app.get('/',function(req,res){
	res.render('index',{
		title:'Inicio',
		saludo:'Hola Arturo'
	});
});

//Funcion que despliega la tabla de los clientes.
app.get('/views/tabla',function(req,res){
    connection.query('select nombre, telefono from clientes',function(err,result){
        if(err){
          console.error(err);
          return;
        }
        else{
          console.error(result);
          var clientes=result;
          console.log('Clientes');
          console.log(clientes);
          res.render('tabla',{
            clientes:clientes
          });
        }
  });
});

//Función que recibe el formulario del HTML
app.post('/users/add',function(req,res){
	req.checkBody('nombre','El nombre es requerido').notEmpty();
	req.checkBody('fechaInicio','Se requiere una fecha de inicio').notEmpty();
	var errors=req.validationErrors();
	if(errors){
		res.render('index',{
			title:'Inicio',
			saludo:'Hola Arturo',
			errors: errors
		});
	}
	else{
    var cliente={
      nombre: req.body.nombre,
      telefono: req.body.telefono
    };
    var query= connection.query('insert into clientes set ?',cliente,function(err,result){
        if(err){
          console.error(err);
          return;
        }
        else{
          console.error(result);
          console.log(query);
        }

    });
		res.send("Todo bien");
	}
});

//Puerto por el cual el servidor está corriendo.
app.listen(port,function(){
	console.log("El servidor esta corriendo");
});
