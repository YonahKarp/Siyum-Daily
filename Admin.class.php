<?php

/**
 * Author: KOORYS LTD By Nizar BOUSEBSI
 * Project: My Mishna.
 * Description: Admin interface.
 * Customer: LEZAM - Elliot Schwartz.
 * Version: 1.0
 **/

require_once('config.php');

// include_once("Security.class.php");

class Admin
{
  /**
   * Getter: Return the current max inactive period.
   **/
  public function getInactivePeriod()
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'SELECT DISTINCT `deactivate_account_after_x_days` FROM `Admin`';
      $result = mysqli_query($bdd, $query);

      if ($result->num_rows > 0) {
        while ($row = mysqli_fetch_row($result)) {
          $inactive = $row[0];
        }
        echo json_encode(array('admin_inactive_period' => $inactive));
     } else {
       return false;
     }
   }
  }

  /**
   * Getter: Return the current cycle period.
   **/
  public function getCyclePeriod()
  {
    if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $query = 'SELECT DISTINCT `cycle_period` FROM `Admin`';
      $result = mysqli_query($bdd, $query);

      if ($result->num_rows > 0) {
        while ($row = mysqli_fetch_row($result)) {
          $cycle = $row[0];
        }
        echo json_encode(array('admin_cycle_period' => $cycle));
     } else {
       return false;
      }
    }
  }

  //used internally to update the number cycle that the users are up to
    public static function getCycleNum()
    {
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'SELECT DISTINCT `cycle_num` FROM `Admin`';
            $result = mysqli_query($bdd, $query);

            if ($result->num_rows > 0) {
                while ($row = mysqli_fetch_row($result)) {
                    $cycle = $row[0];
                    return $cycle;
                }
            } else {
                return false;
            }
        }
    }

    //editting here
    public static function getCyclePeriodAndStatus($id){
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'SELECT DISTINCT `nextCycleDate` FROM `Admin`';
            $result = mysqli_query($bdd, $query);

            $nextDate = mysqli_fetch_row($result)[0];

            $today = date("Y-m-d");

            //If today is (or past) our nextCycleDate, we increment it by 7
            //and set isTaken of *all* to zero
            if($today >= $nextDate){
                $nextDate = date('Y-m-d', strtotime($nextDate. ' + 7 days'));

                $query = 'UPDATE `Admin` SET `nextCycleDate` = "' . $nextDate . '"';
                mysqli_query($bdd, $query);
                $query = 'UPDATE `Mishna` SET `isTaken`= 0';
                mysqli_query($bdd, $query);
                $query = 'UPDATE `Tehillim` SET `isTaken`= 0';
                mysqli_query($bdd, $query);
                $query = 'UPDATE `User` SET `mishna_id`= -1';
                mysqli_query($bdd, $query);
                $query = 'UPDATE `User` SET `tehillim_id`= -1';
                mysqli_query($bdd, $query);


               self::updateStats();

            }


            $query = 'SELECT `last_assigned_mishna_date` FROM `User` WHERE `id` = '. $id;
            $result = mysqli_query($bdd, $query);

            $diff = 1;
            $lastDate = '';
            $needsUpdate = false;

            if ($result->num_rows > 0) {
                while ($row = mysqli_fetch_row($result)) {
                    $lastDate = $row[0];
                }

                $lastDate = new DateTime($lastDate);
                $nextDate = new DateTime($nextDate);

                $diff = $lastDate->diff($nextDate)->format('%r%a');
                if ($diff > 7) {
                    $lastDate = new DateTime(date("Y-m-d"));
                    $diff = $lastDate->diff($nextDate)->format('%r%a');
                    $needsUpdate = true;
                }
            }

            $query = 'SELECT `last_assigned_tehillim_date` FROM `User` WHERE `id` = '. $id;
            $result = mysqli_query($bdd, $query);

            $tehillimUpdate = false;

            if ($result->num_rows > 0) {
                while ($row = mysqli_fetch_row($result)) {
                    $lastDate = $row[0];
                }

                $lastDate = new DateTime($lastDate);
                //$nextDate = new DateTime($nextDate);

                $diff = $lastDate->diff($nextDate)->format('%r%a');
                if ($diff > 7) {
                    $lastDate = new DateTime(date("Y-m-d"));
                    $diff = $lastDate->diff($nextDate)->format('%r%a');
                    $tehillimUpdate = true;
                }
            }

            //todo test format of nextDate
                if($result) {
                    echo json_encode(array("nextDate" => $nextDate->format("Y-m-d"), "needsUpdate" => $needsUpdate, "tehillimUpdate" => $tehillimUpdate ));
                } else {
                    echo json_encode(array("status" => "getCycleFailed"));
                }

        }
    }

    public static function updateCycleNum()
    {
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'UPDATE Admin set cycle_num = cycle_num + 1;';
            mysqli_query($bdd, $query);

            if ($bdd->affected_rows > 0) {
                    return true;
            }
             else {
                return false;
            }
        }
        return false;
    }

    public static function getStatInfo(){
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {

            $query = 'SELECT DISTINCT `mishna_cycle`, `tehillim_cycle`, `totalMishnayos`, `totalTehillim`, `lastWeekMishna`, `lastWeekTehillim` FROM `Admin`';
            $result = mysqli_query($bdd, $query);

            if ($result->num_rows > 0) {
                while ($row = mysqli_fetch_row($result)) {
                    $mishnaCycle = $row[0];
                    $tehillimCycle = $row[1];
                    $totalMishnayos = $row[2];
                    $totalTehillim = $row[3];
                    $lastMishnayos = $row[4];
                    $lastTehillim = $row[5];

                    echo json_encode(array(
                        "mishnaCycle" => $mishnaCycle,
                        "tehillimCycle" => $tehillimCycle,
                        "totalMishnayos" => $totalMishnayos,
                        "totalTehillim" => $totalTehillim,
                        "lastWeekMishnayos" => $lastMishnayos,
                        "lastWeekTehillim" => $lastTehillim,
                    ));
                }
            }
            else
                echo json_encode(array("status" => "Failed"));
        }
    }

    public function updateStats(){
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            //update stats
            $query = 'UPDATE  `Admin` SET `mishna_cycle` = ( SELECT MIN( cycle_Num ) FROM Mishna)';
            mysqli_query($bdd, $query);
            $query = 'UPDATE  `Admin` SET `tehillim_cycle` = ( SELECT MIN( cycle_Num ) FROM Tehillim)';
            mysqli_query($bdd, $query);


            $query = 'SELECT `totalMishnayos`, `totalTehillim` FROM `Admin`';
            $result = mysqli_query($bdd, $query);

            if ($result->num_rows > 0)
                while ($row = mysqli_fetch_row($result)) {
                    $lastTotalMishnayos = $row[0];
                    $lastTotalTehillim = $row[1];
                }

            echo  $lastTotalMishnayos;
            echo  $lastTotalTehillim;

            $query = 'UPDATE  `Admin` SET `totalMishnayos` = ( SELECT Sum( cycle_Num ) FROM Mishna)';
            mysqli_query($bdd, $query);
            $query = 'UPDATE  `Admin` SET `totalTehillim` = ( SELECT Sum( cycle_Num ) FROM Tehillim)';
            mysqli_query($bdd, $query);

            $query = 'UPDATE  `Admin` SET `lastWeekMishna` = ((SELECT MIN(  `totalMishnayos` ) ) - ' . $lastTotalMishnayos . ')';
            mysqli_query($bdd, $query);
            $query = 'UPDATE  `Admin` SET `lastWeekTehillim` = ((SELECT MIN(  `totalTehillim` ) ) - ' . $lastTotalTehillim . ')';
            mysqli_query($bdd, $query);
        }
    }

}

/**
 * Entry point of the API.
 **/
if(isset($_GET['method'])) {
  $method = $_GET['method'];
  $Admin = new Admin();

  //Control the JWT Token.
  // $security = new SecureJwtApi();
  // $security->interceptAuthorizationHeader();

  // getInactivePeriod method.
  if($method === 'getInactive') {
    $Admin->getInactivePeriod();
  }

  //getCyclePeriod method.
  else if($method=== 'getCyclePeriod') {
    $Admin->getCyclePeriod();
  }

  else if($method=== 'getCycleNum') {
      $Admin->getCycleNum();
  }

  else if($method == 'getCyclePeriodAndStatus'){
      $mishnaId = $_GET['id'];
      $Admin->getCyclePeriodAndStatus($mishnaId);
  }

  else if($method === 'getStatInfo') {

      $Admin->getStatInfo();
  }

  else if($method === 'updateStats') {
      $Admin->updateStats();
  }

}
