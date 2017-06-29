<?php

/**
* Author: KOORYS LTD By Nizar BOUSEBSI
* Project: My Mishna.
* Description: Stripe payment API.
* Customer: LEZAM - Elliot Schwartz.
* Version: 1.0
**/

require_once('vendor/stripe/stripe-php/init.php');
require_once("config.php");

// include_once("Security.class.php");

class Stripe
{
  /**
  * Admin email.
  **/
  const _ADMIN_EMAIL_ = "admin-noreply@mymishna.com";

  /**
   * Organization email which validate the sponsor messages.
   **/
   const _ORG_EMAIL_ = "ykccny@gmail.com";

  /**
   * Sponsor ID.
   **/
   private $sponsorLastId;

  /**
  * Initialize Stripe API Key.
  **/
  public function init()
  {
    $stripe = array(
      "secret_key"      => "sk_live_j9M2yCetKOVpK3PXRSK4o42h",//"sk_test_eRw4Q3hlNuh8LuaMou170OMu",
      "publishable_key" => "pk_live_ynoOFmw1eCYUbc0mJO5ZE5dT"//"pk_test_QarxoKh60I3UNi985Anfyjqn"
    );

    \Stripe\Stripe::setApiKey($stripe['secret_key']);
  }

  /**
  * This is where we charge the user for his donation.
  **/
  public function chargeCustomer($email, $token, $amount)
  {
    try {
      $customer = \Stripe\Customer::create(array(
        'email' => $email,
        'card'  => $token
      ));

      $charge = \Stripe\Charge::create(array(
        'customer' => $customer->id,
        'amount'   => $amount,
        'currency' => 'usd'
      ));

      echo json_encode(array("status" => "successfully_charged"));

    } catch(Stripe\Error\InvalidRequest $e) {
      echo json_encode(array("status" => $e));
    }
  }

  /**
  * Contact Admin function.
  * We send an email to the Admin with the Donation details.
  * Admin can reject the Sponsor message and refund the user
  * In Stripe Dashboard.
  **/
  public function contactAdmin($email, $option, $amount, $sponsorMessage)
  {
    //We store the sponsor message and the user details for the VALIDATE process.
    if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $email = mysqli_real_escape_string($bdd, $email);
      $option = mysqli_real_escape_string($bdd, $option);
      $amount = mysqli_real_escape_string($bdd, $amount);
      $sponsorMessage = mysqli_real_escape_string($bdd, $sponsorMessage);

        mysqli_query($bdd, "SET NAMES 'utf8'");

      $query = 'INSERT INTO `Sponsor` (
        `sponsor_id`,
        `email`,
        `selected_option`,
        `amount`,
        `message`,
        `published`) VALUES(NULL, "'.$email.'", "'.$option.'", "'.$amount.'", "'.$sponsorMessage.'", 0)';

        $result = mysqli_query($bdd, $query);

        if ($result) {
          $this->sponsorLastId = mysqli_insert_id($bdd);
          echo json_encode(array("sponsor_new_message" => true));
        } else {
          echo json_encode(array("sponsor_new_message" => false));
          return false;
        }

        if ($bdd) {
          mysqli_close($bdd);
        }
      }



      $to = strip_tags(self::_ORG_EMAIL_) . ", eliatias88@gmail.com, mygroner@gmail.com, mshemesh@ateresShimon.org";
      $subject = '[MyMishna] - New donation !';
      $headers = "From: " . strip_tags(self::_ADMIN_EMAIL_) . "\r\n";
      $headers .= "Reply-To: ". strip_tags($email) . "\r\n";
      $headers .= "MIME-Version: 1.0\r\n";
      $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

      $message = '<html><body>';
      $message .= '<img width="200" src="http://104.131.96.199/mishna-api/mishna-logo.jpg" alt="MyMishna logo" />';
      $message .= '<table rules="all" style="border-color: #666;" cellpadding="10">';
      $message .= "<tr><td><strong>Email:</strong> </td><td>" . strip_tags($email) . "</td></tr>";
      $message .= "<tr><td><strong>Sponsor option:</strong> </td><td>" . strip_tags($option) . "</td></tr>";
      $message .= "<tr><td><strong>Amount:</strong> </td><td>" . strip_tags($amount) . "$</td></tr>";
      $message .= "<tr><td><strong>Sponsor message:</strong> </td><td>" . strip_tags($sponsorMessage) . "</td></tr>";
      $message .= "<tr><td><strong>Validate the donation?</strong> </td><td><a href='http://104.131.96.199/mishna-api/Stripe.class.php?method=validate&sponsorId=" . $this->sponsorLastId  . "'>VALIDATE</a></td></tr>";
      $message .= "</table>";
      $message .= "<p style=color:green;>Click on the VALIDATE link to publish the user Sponsor message. This will make the message visible for everyone using the app.</p>";
      $message .= "<p style=color:red;>You can reject this donation by processing a full-refund in your Stripe Dashboard and also contact the User with the provided email above.</p>";
      $message .= "</body></html>";

      if (!mail($to, $subject, $message, $headers)) {
        echo json_encode(array("contact_admin_status" => false));
      } else {
        echo json_encode(array("contact_admin_status" => true));
      }
    }

    /**
    * Admin decided to publish the User Sponsor message.
    **/
    public function validateSponsorMessage($sponsorId)
    {

      if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
        $query = ' UPDATE `Sponsor` SET `published` = 1 WHERE `sponsor_id` = "'.$sponsorId.'" ';

        $result = mysqli_query($bdd, $query);

        if ($result) {
          echo "<center><h3 style=color:#198e2d;>Sponsor message published with success!</h3></center>";
        } else {
          echo "<center><h3 style=color:#e52727;>Unable to publish this Sponsor message, please check the error logs!</h3></center>";
        }

        if ($bdd) {
          mysqli_close($bdd);
        }
      }
    }

  }

  /**
  * Entry point of the API.
  **/
  if(isset($_GET['method'])) {
    $method = $_GET['method'];
    $Stripe = new Stripe();

    //Initialize Stripe Library.
    $Stripe->init();

    //Control the JWT Token.
    // $security = new SecureJwtApi();
    // $security->interceptAuthorizationHeader();

    //Donate method.
    if($method === 'donate') {
      $email = $_GET['email'];
      $token = $_GET['token'];
      $amount = $_GET['amount'];

      $Stripe->chargeCustomer($email, $token, $amount);
    }

    //Contact Admin method.
    else if ($method === 'contact') {
      $email = $_GET['email'];
      $option = $_GET['option'];
      $amount = $_GET['amount'];
      $message = $_GET['message'];

      $Stripe->contactAdmin($email, $option, $amount, $message);
    }

    //Validate the sponsor message.
    else if ($method === 'validate') {
      $sponsorId = $_GET['sponsorId'];
      $Stripe->validateSponsorMessage($sponsorId);
    }
  }
