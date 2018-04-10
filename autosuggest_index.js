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
        "type": "text",
        "analyzer": "autocomplete_index",
        "search_analyzer": "autocomplete_search"
      },
      "language": {
        "type": "keyword"
      },
      "weight": {
        "type": "long"
      }
    }
  }
}
}
