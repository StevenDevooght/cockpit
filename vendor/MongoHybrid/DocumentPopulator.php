<?php

namespace MongoHybrid;


class DocumentPopulator {
    
    private $documents;
    private $documentProperty;
    private $collection;
    
    public function __construct(&$documents, $documentProperty, $collection) {
        $this->documents = &$documents;
        $this->documentProperty = $documentProperty;
        $this->collection = $collection;
    }
    
    public function populate() {
        $identifiers = $this->constructIdentifiers();
        $populationData = $this->fetchPopulationData($identifiers);
        $this->populateDocuments($populationData);
    }
    
    private function constructIdentifiers() {
        $populationIdentifiers = array();
        foreach($this->documents as $doc) {
            if(isset($doc[$this->documentProperty])) {
                if(is_array($doc[$this->documentProperty])) {
                    foreach($doc[$this->documentProperty] as $property) {
                        $populationIdentifiers[] = $property;
                    }
                } else {
                    $populationIdentifiers[] = $doc[$this->documentProperty];
                }
            }
        }
        
        return $populationIdentifiers;
    }
    
    private function fetchPopulationData($populationIdentifiers) {
        return $this->collection->find(['_id' => ['$in' => $populationIdentifiers]])->toArray();
    }
    
    private function populateDocuments($populationData) {
        foreach($this->documents as &$doc) {
            if(isset($doc[$this->documentProperty])) {
                $result =  $this->populateDocument($doc, $populationData);
                $doc[$this->documentProperty] = $result;
            }
        }
    }
    
    private function populateDocument(&$document, $populationData) {
        if(is_array($document[$this->documentProperty])) {
            $result = array();
            foreach($document[$this->documentProperty] as $relation) {
                $result[] = $this->findIdentifierInPopulationData($populationData, $relation);
            }

            return $result;
        } else {
            return $this->findIdentifierInPopulationData($populationData, $document[$this->documentProperty]);
        }
    }
    
    private function findIdentifierInPopulationData($populationData, $identifier) {
        foreach ($populationData as $population) {
            if($population["_id"] == $identifier) {
                return $population;
            }
        }
    }
    
}
