<?php

use Illuminate\Support\Facades\Route;

/*Route::get('/', function () {
    return view('welcome');
});*/

Route::get('/', function () {
    return view('home' , ['title' => 'Homepage']);
});

Route::get('/about', function () {
    return view('about', ['title' => 'About'], ['name' => 'john']) ;
});

Route::get('/contact', function () {
    return view('contact', ['title' => 'Contact']);
});

Route::get('/blog', function () {
    return view('blog', ['title' => 'Blog', 'name' => 'john']);
});