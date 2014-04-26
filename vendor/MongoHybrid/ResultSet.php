<?php

namespace MongoHybrid;


class ResultSet extends \ArrayObject {

    protected $driver;
    protected $collection;

    public function __construct($driver, $collection, &$documents) {

        $this->driver   = $driver;
        $this->collection = $collection;
        
        parent::__construct($documents);
    }
    
    public function hasOne($collections) {

        foreach ($collections as $fkey => $collection) {
            # code...
        }

    }

    public function hasMany($collections) {

        foreach ($collections as $collection => $fkey) {
            # code...
        }
    }

    public function populate($documentProperty) {
        $collectionBlueprint = $this->driver->findOne("common/collections", array("_id" => $this->collection));
        
        $field = array_filter(
            $collectionBlueprint["fields"],
            function($e) use ($documentProperty) {
                return $e["name"] == $documentProperty;
            }
        );
        
        if($field != null) {
            $collectionId = $field[0]["collection"];
            $collection = $this->driver->getCollection("collections/collection{$collectionId}");

            (new DocumentPopulator($this, $documentProperty, $collection))->populate();
        }
        
        return $this;
    }
    
    public function toArray() {
        return $this->getArrayCopy();
    }
}