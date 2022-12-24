//jshint esversion:6
const mongoose= require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const lodash= require('lodash');
const port= process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//mongoose connection:
mongoose.set("strictQuery", false);
const url = "mongodb+srv://Admin-Nilesh:test123@cluster0.awzcyih.mongodb.net/todolistDB";
mongoose.connect( url, {useNewUrlParser: true}, function(err){
  if(err){
    console.log(err);
  } else{
    console.log("Database connected succesfuuly");
  }
});
const itemsSchema= mongoose.Schema ({
    name: {
      type: String,
      required: [true, 'why not name']
    }
})
const Item= mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your To Do List"
})
const item2= new Item ({
  name: "Click on + button to add new items"
})
const item3= new Item({
  name: "<--- check box to delete an item"
})
// INSERTING ALL DEFAULT VALUES
const defaultItem= [item1, item2, item3];
const listSchema= mongoose.Schema({
    name: String,
    items: [itemsSchema]
})
const List= mongoose.model("List", listSchema);
// Item.insertMany(defaultItem, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("successfully added default Items");
//   }
// });

app.get("/", function(req, res) {
    Item.find({}, (err, data)=>{
      if(data.length===0){
        Item.insertMany(defaultItem, function(err){
          if(err){
            console.log("Try Again");
          }else{
            console.log("successfully added default Items");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: data});
      }
    })
});

app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName= req.body.list;
  const addItem= new Item ({
    name: itemName
  })
  if(listName==="Today"){
    await addItem.save()
     res.redirect("/");
  }else{
    await List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(addItem);
        foundList.save();
        res.redirect("/"+ listName);
      }
    })
  }
});

app.post("/delete",async function(req, res){
  const checkedItemId= req.body.checkbox;
  const checkedItemListName= lodash.capitalize(req.body.list);
  if(checkedItemListName==='Today'){
    Item.findByIdAndDelete( checkedItemId, function(err){
      if(err){
        console.log(err);
      } else{
        console.log("Successfully deleted");
            res.redirect("/");
      }
    });

  }else{
      List.findOneAndUpdate({name: checkedItemListName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        console.log("Success deleted");
         res.redirect("/"+ checkedItemListName);
      }
    })

  }
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName", function(req,res){
  const customListName= lodash.capitalize( req.params.customListName);
  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        const list= new List ({
          name: customListName,
          items: defaultItem
        })
        list.save();
        res.redirect("/"+ customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
  
    // console.log(req.params.customListName);
    // res.redirect("/");
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen( port, function() {
  console.log("Server started on port 3000");
});
