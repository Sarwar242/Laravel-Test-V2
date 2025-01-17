<?php

namespace App\Models;

use Illuminate\Support\Collection;
use Carbon\Carbon;

class Product
{
    protected static $storageFile = 'products.json';

    public $id;
    public $product_name;
    public $quantity;
    public $price;
    public $total_value;
    public $created_at;

    public function __construct($data = null)
    {
        if ($data) {
            $this->id = $data['id'] ?? uniqid();
            $this->product_name = $data['product_name'] ?? '';
            $this->quantity = $data['quantity'] ?? 0;
            $this->price = $data['price'] ?? 0;
            $this->total_value =$this->getTotalValue()?? 0;
            $this->created_at = $data['created_at'] ?? Carbon::now()->toIso8601String();
        }
    }

    public static function create($data)
    {
        $product = new static($data);
        $products = static::all();
        $products->push($product);
        static::save($products);
        return $product;
    }

    public static function all()
    {
        if (!file_exists(storage_path(static::$storageFile))) {
            file_put_contents(storage_path(static::$storageFile), json_encode([]));
            return collect([]);
        }

        $data = json_decode(file_get_contents(storage_path(static::$storageFile)), true);
        return collect($data)->map(fn($item) => new static($item));
    }

    public static function find($id)
    {
        return static::all()->first(fn($product) => $product->id === $id);
    }

    public function update($data)
    {
        $this->product_name = $data['product_name'];
        $this->quantity = $data['quantity'];
        $this->price = $data['price'];

        $products = static::all();
        $products = $products->map(function($product) {
            if ($product->id === $this->id) {
                return $this;
            }
            return $product;
        });

        static::save($products);
        return $this;
    }

    protected static function save($products)
    {
        $data = $products->map(fn($product) => get_object_vars($product));
        file_put_contents(storage_path(static::$storageFile), json_encode($data, JSON_PRETTY_PRINT));
    }

    public function getTotalValue()
    {
        return $this->quantity * $this->price;
    }
}