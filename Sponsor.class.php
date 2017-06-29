<?php

/**
 * Author: KOORYS LTD By Nizar BOUSEBSI
 * Project: My Mishna.
 * Description: Handle the Sponsorised message after Donation.
 * Customer: LEZAM - Elliot Schwartz.
 * Version: 1.0
 **/

require_once('config.php');

// include_once('Security.class.php');

class Sponsor
{
  /**
   * When the user donate something
   * We post his personal message.
   **/
  public function setMessage($email, $option, $amount, $msg)
  {
    if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
        mysqli_query($bdd, "SET NAMES 'utf8'");

        $email = mysqli_real_escape_string($bdd, $email);
        $msg = mysqli_real_escape_string($bdd, $msg);


        $query = 'INSERT INTO `Sponsor` VALUES((SELECT MAX(`sponsor_id`) +1) FROM `Sponsor`) , "'.$email.'", "'.$option.'", "'.$amount.'", "'.$msg.'", 0)'; //todo check query


        //$query = 'INSERT INTO `Sponsor` (`user_id`, `username`, `amount`, `title`, `message`, `option`) VALUES("'.$userId.'", "'.$username.'" , "'.$amount.'", "'.$title.'" ,"'.$msg.'", "'.$option.'")';
        $result = mysqli_query($bdd, $query);

      if ($result) {
        echo json_encode(array('status' => 'sponsor_message_success'));
      } else {
          echo json_encode(array('status' => 'sponsor_message_failure'));
      }
    }

    if ($bdd) {
      mysqli_close($bdd);
    }
  }

  /**
   * Getter: Message by user ID.
   **/
  public function getMessageByUserId($userId)
  {
    $messages = array();

    if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
        mysqli_query($bdd, "SET NAMES 'utf8'");

        $query = 'SELECT DISTINCT `username`, `message` FROM `Sponsor` WHERE `user_id` = "'.$userId.'"';
      $result = mysqli_query($bdd, $query);

      if ($result->num_rows > 0) {
        while ($row = mysqli_fetch_row($result)) {
          array_push($messages, $row);
       }
       echo json_encode(array('messages' => $messages));
      } else {
          echo json_encode(array('messages' => null));
      }

      if ($bdd) {
        mysqli_close($bdd);
      }
    }
  }

  /**
   * Getter: Random message displayed on the Learning screen.
   **/
   public function getRandomMessage()
   {
     if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
         mysqli_query($bdd, "SET NAMES 'utf8'");

         $query = 'SELECT `message` FROM `Sponsor` WHERE `published` = 1 ORDER BY RAND() limit 1';
       $result = mysqli_query($bdd, $query);

       if ($result->num_rows > 0) {
         while ($row = mysqli_fetch_row($result)) {
           $randomMessage = $row[0];
           //$randomAuthor    = $row[1];
           //$randomTitle     = $row[2];
           //$randomMessage   = $row[3];
         }
         //Set the message status to consumed.
         //$this->setMessageStatus($randomMessageId);
         echo json_encode(array("message" => $randomMessage));
       }
       else {
         echo json_encode(array("random" => null));
       }

       if ($bdd) {
        mysqli_close($bdd);
      }
     }
   }

  public function setMessageStatus($msgId, $status)
  {
    if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'UPDATE `Sponsor` SET `published` = '. $status.' WHERE `sponsor_id` = '.$msgId;
      $result = mysqli_query($bdd, $query);

      if ($bdd) {
        mysqli_close($bdd);
      }
     }
  }

    public function setMessageText($msgId, $msg){
        if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            mysqli_query($bdd, "SET NAMES 'utf8'");

            $query = 'UPDATE `Sponsor` SET `message` = "'. $msg.'" WHERE `sponsor_id` = '.$msgId;
            $result = mysqli_query($bdd, $query);

            if ($bdd) {
                mysqli_close($bdd);
            }
        }
    }

    public function deleteMessage($msgId){
        if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            mysqli_query($bdd, "SET NAMES 'utf8'");

            $query = 'DELETE FROM `Sponsor` WHERE `sponsor_id` = '. $msgId;
            $result = mysqli_query($bdd, $query);

            if ($bdd) {
                mysqli_close($bdd);
            }
        }
    }

  /**
   * Will get the published Sponsor messages.
   **/
   public function getSponsorMessages()
   {
     $allPublishedSponsorMessages = array();

     if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
         mysqli_query($bdd, "SET NAMES 'utf8'");

       $query = 'SELECT `message` FROM `Sponsor` WHERE `published` = 1';
       $result = mysqli_query($bdd, $query);

       if ($result->num_rows) {
         while($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
           array_push($allPublishedSponsorMessages, $row);
         }
         echo json_encode($allPublishedSponsorMessages);
       } else {
         echo json_encode(array("sponsor_messages" => false));
       }

       if ($bdd) {
        mysqli_close($bdd);
      }
     }
   }

    public function getAllSponsorData(){
        $allSponsorData = array();

        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            mysqli_query($bdd, "SET NAMES 'utf8'");

            $query = 'SELECT `sponsor_id`, `email`, `amount`, `message`, `published` FROM `Sponsor`';
            $result = mysqli_query($bdd, $query);

            if ($result->num_rows) {
                while($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                    array_push($allSponsorData, $row);
                }
                echo json_encode($allSponsorData);
            } else {
                echo json_encode(array("sponsor_messages" => false));
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
  $Sponsor = new Sponsor();

  //Control the JWT Token.
  // $security = new SecureJwtApi();
  // $security->interceptAuthorizationHeader();

  //setMessage method.
  if($method === 'setMessage') {
    $email = $_GET['email'];
    $option = $_GET['option'];
    $amount = $_GET['amount'];
    $msg = $_GET['message'];

    $Sponsor->setMessage($email, $option, (int)$amount, $msg);
  }

  //getMessage method.
  else if($method === 'get') {
    $userId = $_GET['userId'];

    $Sponsor->getMessageByUserId($userId);
  }

  //getRandomMessage method.
  else if($method === 'random') {
    $Sponsor->getRandomMessage();
  }

  //get all published Sponsor messages.
  else if($method === 'getSponsorMessages') {
    $Sponsor->getSponsorMessages();
  }

  //get all sponsor data (for admin)
  else if($method === 'getAllSponsorData') {
      $Sponsor->getAllSponsorData();
  }

  //set published status for message
  else if($method === 'setMessageStatus') {
      $msgId = $_GET['id'];
      $status = $_GET['status'];

      $Sponsor->setMessageStatus($msgId, $status);
  }

  else if($method === 'setMessageText') {
      $msgId = $_GET['id'];
      $msg = $_GET['message'];

      $Sponsor->setMessageText($msgId, $msg);
  }

  else if($method === 'deleteMessage') {
      $msgId = $_GET['id'];

      $Sponsor->deleteMessage($msgId);
  }
}
