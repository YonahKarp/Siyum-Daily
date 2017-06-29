<?php
/**
 * Created by IntelliJ IDEA.
 * User: YonahKarp
 * Date: 5/21/17
 * Time: 1:39 AM
 */

require_once('vendor/stripe/stripe-php/init.php');
require_once('Stripe.class.php');






// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
\Stripe\Stripe::setApiKey("sk_live_j9M2yCetKOVpK3PXRSK4o42h");

// Token is created using Stripe.js or Checkout!
// Get the payment token submitted by the form:
$token = $_POST['stripeToken'];

$stripeinfo = \Stripe\Token::retrieve($token);
$email = $stripeinfo->email;


$amount = $_POST['amount'];
$message = $_POST['message'];
$messageType = $_POST['messageType'];


// Charge the user's card:
$charge = \Stripe\Charge::create(array(
    "amount" => $amount*100,
    "currency" => "usd",
    "description" => "Example charge",
    "source" => $token,
));

$Stripe = new Stripe();

$Stripe->contactAdmin($email,"option", $amount, $messageType . $message);

header( 'Location: http://www.ateresshimon.org/thankyou.html' ) ;




