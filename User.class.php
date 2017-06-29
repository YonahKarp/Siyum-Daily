<?php

/**
* Author: KOORYS LTD By Nizar BOUSEBSI
* Project: My Mishna.
* Description: API to manage the User Repository.
* Customer: LEZAM - Elliot Schwartz.
* Version: 1.0
**/

require_once("config.php");

// include_once("Security.class.php");


class User
{
  private $security;

  /**
   * Constructor.
   **/
   public function __construct()
   {
    //  $this->security = new SecureJwtApi();
   }

  /**
  * When the user clicks on Logout button.
  **/
  public function actionLogoutUser()
  {
    session_destroy();
  }


    //todo error check
  /**
  * Register a new user into the database.
  **/
  public function actionSignUpNewUser($email, $phone)
  {
    if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $email = mysqli_real_escape_string($bdd, $email);
      $phone = mysqli_real_escape_string($bdd, $phone);
      //$selectedMishnaLanguage = mysqli_real_escape_string($bdd, $selectedMishnaLanguage);

        //set default date far back enough to give new mishna, but not too far back
        $date = date("Y-m-d", strtotime(date("Y-m-d"). ' - 7 days'));
      $query = ' INSERT INTO `User` (
          `id`,
          `email`,
          `phone`,
          `last_login_date`,
          `last_completed_mishna_date`,
          `last_completed_tehillim_date`,
          `last_assigned_mishna_date`,
          `last_assigned_tehillim_date`
        ) VALUES("","'.$email.'", "'.$phone.'", NOW(),"'.$date.'","'.$date.'","'.$date.'","'.$date.'") ';
        $result = mysqli_query($bdd, $query);

        if ($result) {
          //$this->actionSetDefaultSettings(mysqli_insert_id($bdd), null, false, null, null);

          echo json_encode(array('status' => 'register_success',
              'userId'  =>  mysqli_insert_id($bdd),
              'email'   =>  $email,
              'phone'   =>  $phone,
              'learning_selection' => 'mishnayos',
              'alert_time' => '00:00:00',
              'last_completed_mishna_date'   =>  $date,
              'last_completed_tehillim_date' =>  $date,
              'next_cycle_date' => date("Y-m-d", strtotime(date("Y-m-d"). ' - 1 days')),
              'mishna_id' => -1,
              'tehillim_id' => -1,
              'totalMishna' => 0,
              'totalTehillim' => 0
          ));
        } else {
          echo json_encode(array('status' => 'register_failure'));
        }
    }

    if ($bdd) {
      mysqli_close($bdd);
    }
  }

    /**
    * We check here the user credentials
    * And allow him or not to access to the app.
    * We use JWT Technology to secure all the call to the API.
    **/
    public function actionLoginUser($authElement)
    {

      if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
          $auth = mysqli_real_escape_string($bdd, $authElement);

        $query = 'SELECT 
          `id`,
          `email`,
          `phone`,
          `learning_selection`,
          `alert_time`,
          `last_completed_mishna_date`,
          `last_completed_tehillim_date`,
          `mishna_id`,
          `tehillim_id`,
          `total_mishna_completed`,
          `total_tehillim_completed` FROM `User` WHERE `email` = "'.$auth.'"';
        $result = mysqli_query($bdd, $query);

        if($result->num_rows) {
          while ($row = mysqli_fetch_row($result)) {
              $userId = $row[0];
              $email = $row[1];
              $phone = $row[2];
              $learning_selection = $row[3];
              $alert_time = $row[4];
              $lastMishna = $row[5];
              $lastTehillim = $row[6];
              $mishnaId = $row[7];
              $tehillimId = $row[8];
              $totalMishna = $row[9];
              $totalTehillim = $row[10];
          }

            $query = 'SELECT DISTINCT `nextCycleDate` FROM `Admin`';
            $result = mysqli_query($bdd, $query);

            $nextDate = mysqli_fetch_row($result)[0];


          //Generate JWT Token after successfull credentials.
          //$jwtToken = $this->security->generateJwtToken();
          echo json_encode(array('status' => 'login_success',
              'userId'  => $userId,
              'email'   =>  $email,
              'phone'   =>  $phone,
              'learning_selection'  => $learning_selection,
              'alert_time'          => $alert_time,
              'last_completed_mishna_date'   =>  $lastMishna,
              'last_completed_tehillim_date' =>  $lastTehillim,
              'next_cycle_date' => $nextDate,
              'mishna_id'       => $mishnaId,
              'tehillim_id'     => $tehillimId,
              'totalMishna'     => $totalMishna,
              'totalTehillim'   => $totalTehillim
          ));
        } else
          echo json_encode(array('status' => 'login_failed'));

        if ($bdd)
          mysqli_close($bdd);
      }
    }

    public function storeSettings($userId, $learning_selection, $alert_time){
        if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'UPDATE `User` 
                      SET `learning_selection`= "' . $learning_selection . '", `alert_time` = "' . $alert_time . '" 
                      WHERE `id` = ' . $userId;
            mysqli_query($bdd, $query);
        }
    }

    /**
    * User wants to delete his account
    **/
    public function delete($userId)
    {
      if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
        $queryUser = ' DELETE FROM `User` WHERE `id` = "'.$userId.'" ';

        $result = mysqli_query($bdd, $queryUser);

        if($result) {
          echo json_encode(array("status" => "delete_success"));
        } else {
          echo json_encode(array("status" => "delete_failure"));
        }

        if ($bdd) {
          mysqli_close($bdd);
        }
      }
    }

    /**
    * Getter: User id by his email.
    **/
    public function getUserIdByEmail($email)
    {
      if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
        $query = ' SELECT `email` FROM `User` WHERE `email` = "'.$email.'" ';

        $result = mysqli_query($bdd, $query);

        if ($result->num_rows >= 1)
          return true;
        else
          return false;
      }
    }
  }

  /**
  * Entry point of the API.
  **/
  if(isset($_GET['method'])) {
    $method = $_GET['method'];
    $User = new User();

    //Control the JWT Token.
    // $security = new SecureJwtApi();
    // $security->interceptAuthorizationHeader();

    //SignUp method.
    if($method === 'signup') {
      $email = $_GET['email'];
      $phone = $_GET['phone'];
      //$selectedMishnaLanguage = $_GET['selectedMishnaLanguage'];

      //We first need to check that the user doesn't exist in our database.
      $isExistant = false;
      $isExistant = $User->getUserIdByEmail($email);

      if ($isExistant === true) {
        echo json_encode(array("status" => "email_already_exist"));
        die();
      } else {
        $User->actionSignUpNewUser($email, $phone);
      }
    }

    //SignIn method.
    else if($method === 'signin') {
      $phone = $_GET['phone'];

      $User->actionLoginUser($phone);
    }

    //delete method.
    else if($method === 'delete') {
      $userId = $_GET['data'];

      $User->delete($userId);
    }

    //storeUserSettings
    else if($method === 'storeSettings') {
        $userId = $_GET['id'];
        $learning_selection = $_GET['learning_selection'];
        $alert_time = $_GET['alert_time'];

        $User->storeSettings($userId, $learning_selection, $alert_time);
    }

  }
