<?php

/**
 * Author: KOORYS LTD By Nizar BOUSEBSI
 * Project: My Mishna.
 * Description: Cron Job based on Cycle.class.php file
 * Customer: LEZAM - Elliot Schwartz.
 * Version: 1.0
 **/

include_once('Cycle.class.php');

class Cron {
  /**
   * Run the task to set all users
   * With the same X day cycle period.
   **/
  public function run()
  {
    $Cycle = new Cycle();

    $result = $Cycle->actionSetCyclePeriodForEveryUsers();

    if($result) {
      $logs = "\n" . ' - Status: Successfully set the new cycle period.' . "\n";
    } else {
      $logs = "\n" . ' - Status: Failed to set the new cycle period.' . "\n";
    }

    //Write into the cron-logs.txt file.Mishna.class.php
    chmod('/var/www/html/mishna-api/cron-logs.txt', 0777);
    $fp = fopen('./cron-logs.txt', 'a+');

    fwrite($fp, '***** Start run time at: ' . date("Y/m/d h:i:s") . ' *****' . "\n");
    fwrite($fp, $logs);
    fwrite($fp, '=======================================================================================' . "\n");

    fclose($fp);
  }
}

$Cron = new Cron();
$Cron->run();
