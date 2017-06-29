<?php
/**
 * Author: KOORYS LTD By Nizar BOUSEBSI
 * Project: My Mishna.
 * Description: JWT System to avoid back-end hack.
 * Customer: LEZAM - Elliot Schwartz.
 * Version: 1.0
 **/

require_once __DIR__.'/vendor/autoload.php';

use Namshi\JOSE\SimpleJWS;

class SecureJwtApi
{
  /**
   * Every time a User login Successfully
   * We generate a new secure JWT token.
   * This JWT token will be asked for every request made.
   **/
  public function generateJwtToken()
  {
    $jws  = new SimpleJWS(array(
        'alg' => 'RS256'
    ));

    $jws->setPayload(array(
        'uid' => 142,
    ));

    $privateKeyFile = file_get_contents("./ssl/mymishna.key");
    $privateKey = openssl_pkey_get_private($privateKeyFile);

    $publicKeyFile = file_get_contents("./ssl/public.key");

    $jws->sign($privateKey);
    return $jws->getTokenString();
  }

  /**
   * We check the JWT token at every request.
   * If someone try to request the back-end outside
   * the app, it will fail for him :D
   **/
   public function checkJwtToken($jwtToken)
   {
     try {
       $jws = SimpleJWS::load($jwtToken);

       $publicKeyFile = file_get_contents("./ssl/public.key");
       $public_key = openssl_pkey_get_public($publicKeyFile);

       if ($jws->isValid($public_key, 'RS256')) {
         $payload = $jws->getPayload();
       } else {
          echo json_encode(array('security_check' => "Invalid JWT Token!"));
          return false;
        }
     } catch(InvalidArgumentException $e) {
       echo json_encode(array('security_check' => "Invalid JWT Token!"));
       exit();
     }
     return true;
   }

   /**
    * Intercept the request token.
    **/
    public function interceptAuthorizationHeader()
    {
      $headers = apache_request_headers();

      if(isset($headers['authorization'])) {
        $authorization = $headers['authorization'];

        $jwtToken = explode(" ", $authorization)[1];
        $this->checkJwtToken($jwtToken);
      } else {
        echo json_encode(array('security_check' => "Invalid JWT Token!"));
        exit();
      }
    }

}
