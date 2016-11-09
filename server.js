var express = require("express");
var app     = express();
app.use(express.static(__dirname + '/images'));
var mysql      = require('mysql');
var bodyParser = require('body-parser');
app.use(bodyParser());
app.set('view engine', 'ejs');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'kumar',
  database : 'movie'
});
var un="";
var userEmail="";
app.get('/',function(req,res){
	res.render('login1',{error:"",message:""});
});
app.post('/buyNow',function(req,res){
	var id=req.body.user.product_id;
	var queryString = 'SELECT * FROM products WHERE product_id = ?';
	connection.query(queryString,[id],function(err,products){
		if(err) throw err;
		else
			res.render('selectedProduct',{products:products,un:un,id:id});
	});
});
app.post('/confirmOrder',function(req,res){

	var userData={
		pincode:req.body.user.pincode,
		username:req.body.user.username,
		address:req.body.user.address,
		landmark:req.body.user.landmark,
		city:req.body.user.city,
		phone:req.body.user.phone,
		qty:req.body.user.qty
	}

	var product_op=req.body.user.product_op;
	var qty=req.body.user.qty;
	var price=qty*product_op;
	var id=req.body.user.product_id;
	var queryString = 'SELECT * FROM products WHERE product_id = ?';
	connection.query(queryString,[id],function(err,products){
		if(err) throw err;
		else
			res.render('confirmOrder',{products:products,un:un,userData:userData,price:price});
	});
});
app.get('/logout',function(req,res){
	un="";
	userEmail="";
	res.render('login1',{error:"",message:""});
});
app.post('/orderFinal',function(req,res){
	var product_id=req.body.user.product_id;
	var shipingAddress=req.body.user.pincode+"\n"+req.body.user.username+"\n"
						+req.body.user.address+req.body.user.landmark+"\n"
						+req.body.user.city+"\n"+req.body.user.phone;
	var qty=req.body.user.qty;
	var price=req.body.user.price;
	var data={
		userEmail:userEmail,
		product_id:product_id,
		shipingAddress:shipingAddress,
		qty:qty,
		price:price
	};
	if(req.body.user.confirm_button==="1"){
		connection.query('INSERT INTO orders SET ?',data,function(err,result){
			if(err) throw err;
			else{
				res.render('thankyou',{un:un,error:"",message:""});
			}
		});
	}
	else if(req.body.user.confirm_button==="2"){
		res.render('home',{un:un});
	}
	

});
app.post('/products',function(req,res){
	var i=req.body.user.category_button;
	var queryString = 'SELECT * FROM products WHERE product_cat = ?';
	connection.query(queryString,[i],function(err,products){
		if(err) throw err;
		else
			res.render('products',{products:products,un:un,id:i});
	});
});
app.post('/register', function(req, res){
	var i=req.body.user.email;
	var j=req.body.user.username;
	var k=req.body.user.password;
	var data={
		email:i,username:j,password:k
	};
	connection.query('SELECT * from sigup',function(err,emails){
		if(err) throw err;
		else if(emails.length>0){
			var number=0;
			for(var x=0;x<emails.length;x++){
				if(emails[x].email===i){
					number=1;
					res.render('login2',{error:"Email already Exits",message:""});
				}
			}
			if(number===0){
				connection.query('INSERT INTO sigup SET ?',data,function(err,result){
					if(err) throw err;
					else{
						res.render('login1',{message:"Register success Login here",error:""});
					}
				});
			}
		}
		else{
			connection.query('INSERT INTO sigup SET ?',data,function(err,result){
				if(err) throw err;
				else{
					connection.query('SELECT * from items',function(err,items){
						if(err) throw err;
						else{
							res.render('home',{items:items});
						}	
					});
				}
			});
		}
	});
});
app.post('/login',function(req,res){
	var i=req.body.user.email;
	var j=req.body.user.password;
	var number=0;
	connection.query('SELECT * from sigup',function(err,data){
		if(err) throw err;
		else{
			connection.query('SELECT * from products',function(err,products){
				if(err) throw err;
				else{
					for(var k=0;k<data.length;k++){
						if(data[k].email===i&&data[k].password===j){
							number=1;
							un=data[k].username;
							userEmail=data[k].email;
							res.render('home',{un:data[k].username,products:products});
						}
					}
					if(number===0){
						res.render('login1',{error:"username and password doesnt match",message:""});
					}
				}	
			});
		}
	});
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
}
});

app.listen(3000);
console.log("Running at Port 3000");