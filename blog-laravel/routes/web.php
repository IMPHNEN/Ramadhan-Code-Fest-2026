<?php

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Route;

/*Route::get('/', function () {
    return view('welcome');
});*/

Route::get('/', function () {
    return view('home' , ['title' => 'Homepage']);
});

Route::get('/about', function () {
    return view('about', ['title' => 'About'], ['name' => 'Dammiyan ']) ;
});

Route::get('/contact', function () {
    return view('contact', ['title' => 'Contact']);
});


Route::get('/posts/{id}', function($id) {
    $posts = [
         [
            'id' => 1,
            'title' => 'Just One',
            'author' => 'Dammiyan',
            'body' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                  Magni ex vitae'
        ],
        
        [
            'id' => 2,
            'title' => 'Just Two',
            'author' => 'Dammiyan',
            'body' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                  Magni ex vitae suiqwnas jsdhsdapijn ajndasa'
        ]
    ];

    $post = Arr::first($posts, function ($post) use ($id) {
        return $post['id'] == $id;
    });
     
    return view('post', ['title' => 'Single Post', 'post' => $post]);
});





Route::get('/posts', function () {
    return view('posts', ['title' => 'Blog' ,'posts' => [
        [
            'id' => 1,
            'title' => 'Just One',
            'author' => 'Dammiyan',
            'body' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                  Magni ex vitae'
        ],
        
        [
            'id' => 2,
            'title' => 'Just Two',
            'author' => 'Dammiyan',
            'body' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                  Magni ex vitae suiqwnas jsdhsdapijn ajndasa'
        ]
    ]]);
});