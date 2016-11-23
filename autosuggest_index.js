const commandLineArgs = require('command-line-args')
const options = commandLineArgs([
  { name: 'eshost' },
  { name: 'index' }
])



var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts: options.eshost
});

var body = 
{"settings":{
  "number_of_shards": 1,
  "analysis": {
    "filter": {
      "autocomplete_filter": {
        "type": "edge_ngram",
        "min_gram": 1,
        "max_gram": 30,
        "token_chars": [
          "letter",
          "digit",
          "punctuation",
          "symbol"
        ]
      }
    },
    "analyzer": {
      "autocomplete_index": {
        "type": "custom",
        "tokenizer": "whitespace",
        "filter": [
          "lowercase",
          "autocomplete_filter",
          "asciifolding"
        ]
      },
      "autocomplete_search": {
        "type": "custom",
        "tokenizer": "whitespace",
        "filter": [
          "lowercase",
          "asciifolding"
        ]
      }
    }
  }
},
"mappings":{
  "terms": {
    "properties": {
        "term": {
        "type": "string",
        "analyzer": "autocomplete_index",
        "search_analyzer": "autocomplete_search"
      },
      "language": {
        "type": "string",
        "index": "not_analyzed"
      },
      "weight": {
        "type": "long"
      }
    }
  }
}
}
client.indices.create({  
  index: options.index, body:body
},function(err,resp,status) {
  if(err) {
    console.log(err);
  }
  else {
    console.log("create",resp);
  }
});


var inputfile = require("./terms.json");
var bulk = [];

var makebulk = function(terms,callback){
  for (var current in terms){
    bulk.push(
      { index: {_index: options.index, _type: 'terms' } },
      {
        'term': terms[current].term,
        'language': terms[current].language,
        'weight': terms[current].weight        
      }
    );
  }
  callback(bulk);
}

var indexall = function(madebulk,callback) {
  client.bulk({
    maxRetries: 5,
    index: options.index,
    type: 'terms',
    body: madebulk
  },function(err,resp,status) {
      if (err) {
        console.log(err);
      }
      else {
        callback(resp.items);
      }
  })
}

makebulk(inputfile,function(response){
  console.log("Bulk content prepared");
  indexall(response,function(response){
    console.log(response);
  })
});


