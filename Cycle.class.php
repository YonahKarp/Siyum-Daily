<?php

/**
 * Author: KOORYS LTD By Nizar BOUSEBSI
 * Project: My Mishna.
 * Description: This is the script witch communicate with
 *              The cronjob running on the server to cycle the Mishna.
 * Customer: LEZAM - Elliot Schwartz.
 * Version: 1.0
 **/
require_once('config.php');

class Cycle
{
  /**
   * This is not an API call
   * It is only used by the cronjob to set
   * All the users at the same cycling period of Mishna.
   * Please, try to not call this method via API request.
   **/
  public function actionSetCyclePeriodForEveryUsers()
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'UPDATE `User` SET `cycle_status` = 1';
      $result = mysqli_query($bdd, $query);

      if($result) {
        return true;
      } else {
        return false;
      }

      if ($bdd) {
        mysqli_close($bdd);
      }
    }
  }

  /**
   * This is the only method from Cycle module
   * That you can call via API request to set properly
   * The cycling period to X day(s).
   * This call can be already used by the Admin Client interface.
   *
   **/
  public function actionAdminSetCycle($period)
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'UPDATE `Admin` SET `cycle_period` = "'.$period.'"';
      $result = mysqli_query($bdd, $query);

      if($result) {
        echo json_encode(array('status' => 'cycle_admin_set_period_success'));
      } else {
          echo json_encode(array('status' => 'cycle_admin_set_period_failure'));
      }

      if ($bdd) {
        mysqli_close($bdd);
      }
    }
  }

  /**
   * Reset the Cycle Status for one user id.
   **/
  public function resetCycle($userId)
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'UPDATE `User` SET `cycle_status` = 0 WHERE `id` = "'.$userId.'"';
      $result = mysqli_query($bdd, $query);

      if($result) {
        return true;
      } else {
          return false;
      }

      if ($bdd) {
        mysqli_close($bdd);
      }
    }
  }

  /**
   * Getter: Cycle status.
   **/
  public function getStatus($userId)
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'SELECT `cycle_status` FROM `User` WHERE `id` = "'.$userId.'"';
      $result = mysqli_query($bdd, $query);

      if($result->num_rows) {
        while ($row = mysqli_fetch_row($result)) {
          $cycleStatus = $row[0];
        }
        return $cycleStatus;
      } else {
          return false;
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
  $Cycle = new Cycle();

  //setCyclePeriod method.
  if($method === 'setCyclePeriod') {
    $period = $_GET['period'];
    $Cycle->actionAdminSetCycle($period);
  }
}
