<?php
header('Content-Type: text/html; charset=utf-8');

/**
 * Author: Yonah Karp
 * Project: My Mishna.
 * Version: 1.0
 **/

require_once("config.php");

include_once("Cycle.class.php");
// include_once("Security.class.php");

class Mishna
{
  /**
   * One Mishna portion is affected to only one User.
   **/
  public function actionMarkMishnaAsTaken($id)
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'UPDATE Mishna SET `isTaken` = 1 WHERE `mishna_id` = "'.$id.'"';
      $result = mysqli_query($bdd, $query);

      if ($result) {
        return true;
      } else {
          return false;
      }
    }
  }

  /*
    public function markMishnaNotTake($userId){
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'SELECT `mishna_id` FROM `User` WHERE `id` = ' . $userId;
            $result = mysqli_query($bdd, $query);

            $mishnaId = mysqli_fetch_row($result)[0];

            $query = 'UPDATE Mishna SET `isTaken` = `isTaken` - 1  WHERE `mishna_id` = ' . $mishnaId;
            mysqli_query($bdd, $query);
        }
    }*/



  /**
   * This is the method which gives the User
   * a random portion of Mishna
   **/
  public function actionAffectRandomMishnaPortion($userId){
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {

        //$this->markMishnaNotTake($userId); //already take care of by system

      //To avoid Hebrew characters encoding issues.
      mysqli_query($bdd, "SET NAMES 'utf8'");



        //$currentCycle = Admin::getCycleNum();

        $query = 'SELECT `mishna_id`/*, `hebrew`, `english`, `mesechta`, `chapter`, `mishnaNum`*/ FROM `Mishna` 
                  WHERE  (`isTaken` + `cycle_num`) =
                  (SELECT MIN(`isTaken` + `cycle_num`) FROM `Mishna`)  ORDER BY `mishna_id` ASC';


        $result = mysqli_query($bdd, $query);
        $numRows = mysqli_num_rows($result);


        /*
        if(mysqli_num_rows($result) <= 0){
            Admin::updateCycleNum();
            $result = mysqli_query($bdd, $query);
        }*/

        $mishnaId = -1;
      if ( $numRows > 0) {
        $row = mysqli_fetch_row($result); //fetch first row
          $mishnaId = $row[0];
            //$hebrew = $row[1];
            //$english = $row[2];
            //$mesechta = $row[3];
            //$chapter = $row[4];
            //$mishna = $row[5];
          //$mishnaContent = $row[1];


          $query = 'UPDATE `User` SET `mishna_id` = '.$mishnaId.' WHERE `id` =  '. $userId;
          mysqli_query($bdd, $query);

        //Mark the assigned Mishna as taken.
          $val = $this->actionMarkMishnaAsTaken($mishnaId);

        if($val) {
            echo json_encode(array("mishna_id" => $mishnaId));
            /*, "hebrew" => $hebrew, "english" => $english,
                "mesechta" => $mesechta, "chapter" => $chapter, "mishna" => $mishna));*/

        } else {
            echo json_encode(array("status" => "random_mishna_failure"));
        }
      }
    }
  }

  /**
   * When the user complete the Mishna portion.
   **/
  public function actionCompleteMishnaPortion($userId, $mishnaId) //todo remove userID
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {

        //todo increment user's total

        //$query = 'UPDATE `Mishna` SET `isTaken` = 0 WHERE `mishna_id` = '.$mishnaId.'; ';
        $query = 'UPDATE `Mishna` SET `cycle_num` = `cycle_num` + 1 WHERE `mishna_id` = '.$mishnaId.'; ';
        $result = mysqli_query($bdd, $query);

        $query = 'UPDATE `User` SET `total_mishna_completed` = `total_mishna_completed` + 1 WHERE `id` = '.$userId.'; ';
        mysqli_query($bdd, $query);

      if ($result) {
        //$this->actionUpdateLastCompletedMishnaDate($userId);
        echo json_encode(array("status" => "complete_mishna_success"));
      } else {
          echo json_encode(array("status" => "complete_mishna_failure"));
      }
    }
  }


  /**
   * We keep track of the Mishna assigned date
   * In order to determine if the user is active or not.
   */
   public function actionSetMishnaAssignedDate($userId)
   {
     if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
       $query = 'UPDATE `User` SET `last_assigned_mishna_date` = NOW() WHERE `id` = "'.$userId.'"';
       mysqli_query($bdd, $query);
     }
   }


}

/**
 * Entry point of the API.
 **/
if(isset($_GET['method'])) {
  $method = $_GET['method'];
  $Mishna = new Mishna();

  //Control the JWT Token.
  // $security = new SecureJwtApi();
  // $security->interceptAuthorizationHeader();

  //Random method.
  if($method === 'random') {
    $userId = $_GET['userId'];

    $Mishna->actionAffectRandomMishnaPortion($userId);
  }

  /*Specific mishna
  else if($method === 'get') {
      $mishnaId = $_GET['mishnaId'];
      $Mishna->actionGetMishna((int) $mishnaId);
  }

  //regrab mishna
  else if($method === 'regrab') {
      $userId = $_GET['userId'];

      $Mishna->regrabMishna($userId);
  }*/


  //Complete method.
  else if($method === 'complete') {
    $userId = $_GET['userId'];
    $mishnaId = $_GET['mishnaId'];

    $Mishna->actionCompleteMishnaPortion((int)$userId, (int)$mishnaId);
  }

  /*getCycleStatus method.
  else if($method === 'getCycleStatus') {
    $userId = $_GET['data'];

    $Mishna->actionGetCurrentCycleStatus((int)$userId);
  }

  //resetCycleStatus.
  else if($method === 'resetCycleStatus') {
    $userId = $_GET['data'];

    $Mishna->actionResetCycleStatus((int)$userId);
  }*/

  //actionSetMishnaAssignedDate.
  else if($method === 'assignMishnaDate') {
    $userId = $_GET['data'];

    $Mishna->actionSetMishnaAssignedDate((int)$userId);
  }

  /*
  else if($method === 'getCommentary'){
      $mishnaId = $_GET['data'];
      $Mishna->actionGetCommentary((int)$mishnaId);
  }*/

}
