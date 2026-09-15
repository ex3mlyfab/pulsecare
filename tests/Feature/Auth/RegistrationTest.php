<?php

test('the registration route is no longer available', function () {
    $response = $this->get('/register');

    $response->assertNotFound();
});

test('the registration store route is no longer available', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertNotFound();
    $this->assertGuest();
});
