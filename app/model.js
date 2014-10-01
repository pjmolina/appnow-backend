
//Data model for Backend-Services  ---------------

var mongoose = require('mongoose');

// Create Mongoose schemas
var UserSchema = new mongoose.Schema({ 
  	name: { type: String, required: true },
	surname: { type: String, required: true }
});




//Create full text indexes (experimental)--- 
/*
    UserSchema.index({
    	name: 'text',
		surname: 'text'    
    });
*/


// Sample to inject operations into mongoose schemas
//UserSchema.pre('save', function (next) {
//  console.log('A User was saved to MongoDB: %s.', this.get('name'));
//  next();
//});

var propertiesForClass = {
	"user" : ['name', 'surname']  
};


//Models ----
var UserModel = mongoose.model('user', UserSchema);
  

function getModelForClass(className) {
  if ('user'==className) {
    return UserModel;
  }
  
  return null;
}




function getCsvHeader(className) {
  var res="_id"; prefix=",";
  var props = propertiesForClass[className];
  if (props) {
    for(var index in props) {
      res += prefix + csvEncode(props[index]);
    }
    return res+"\r\n";
  }
  return null;
}
function toCsv(objects, className) {
  var res = getCsvHeader(className);
  var props = propertiesForClass[className];
  if (props) {
    for(var j in objects) {
      var item = objects[j];
      res += item._id;
      var prefix = ",";
      for(var index in props) {
        res += prefix + csvEncode(item[props[index]]);
      }
      res +="\r\n";
    }
  }
  return res;
}
function isObjectId(obj) {
  return (typeof obj === 'object' && obj._bsontype === 'ObjectID');
}
function csvEncode(data) {
  var text;
  if (data == null) {
    return '';
  }
  if (isObjectId(data)) {
    return data.toString();
  }
  text = data.toString();
  
  if ((text.indexOf(',') >= 0) || (text.indexOf('.') >= 0) || (text.indexOf(' ') >= 0)) {
    return '"' + text + '"';
  }   
  return text;
}

function toXml(objects, className) {
  var res = '<?xml version="1.0" encoding="UTF-8"?>\r\n<data>\r\n';
  var props = propertiesForClass[className];
  if (props) {
    for(var j in objects) {
      var item = objects[j];
      res += '  <' + className + '><id>' + item._id + '</id>';
      for(var index in props) {
        var prop = props[index];
        res += '<'+ prop + '>' + xmlEncode(item[prop]) + '</' + prop + '>';
      }
      res +='</' + className + '>\r\n';
    }
  }
  return res + "</data>\r\n";
}
function xmlEncode(data) {
  if (data == null) return '';
  var res = data.toString().replace(/&/g, '&amp;')
                .replace(/'/g, '&apos;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
  ;
  return res;
}

function toXlsx(objects, className) {
  var res = "XLSX todo";
  var props = propertiesForClass[className];  
  return res;
}


// Register the schema and export it
module.exports.UserModel    = UserModel;

module.exports.getModelForClass = getModelForClass;
module.exports.toCsv = toCsv;
module.exports.toXlsx = toXlsx;
module.exports.toXml = toXml;
