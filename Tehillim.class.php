<?php

/**
 * Created by IntelliJ IDEA.
 * User: YonahKarp
 * Date: 2/9/17
 * Time: 9:30 AM
 */

require_once("config.php");

include_once("Cycle.class.php");
include_once ("Admin.class.php");

class Tehillim
{

    /**
     * This is the method which gives the User
     * a random portion of Tehillim
     **/
    public function actionAffectRandomTehillimPortion($userId){
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {

            //$this->markTehillimNotTake($userId);

            //To avoid Hebrew characters encoding issues.
            mysqli_query($bdd, "SET NAMES 'utf8'");

            //$currentCycle = Admin::getCycleNum();

            //$query = 'SELECT `id`, `hebrew`, `english`, `mesechta`, `chapter`, `tehillimNum` FROM `Tehillim` WHERE `isTaken` != 1 AND cycle_num < '. $currentCycle .' ORDER BY tehillim_Id';
            $query = 'SELECT `id` /*,`hebrew`, `english`, `chapter`*/ FROM `Tehillim` 
                  WHERE  (`isTaken` + `cycle_num`) =
                  (SELECT MIN(`isTaken` + `cycle_num`) FROM `Tehillim`)  ORDER BY `id` ASC';


            $result = mysqli_query($bdd, $query);
            $numRows = mysqli_num_rows($result);


            /*
            if(mysqli_num_rows($result) <= 0){
                Admin::updateCycleNum();
                $result = mysqli_query($bdd, $query);
            }*/

            $tehillimId = -1;
            if ( $numRows > 0) {
                $row = mysqli_fetch_row($result); //fetch first row
                $tehillimId = $row[0];
                //$hebrew = $row[1];
                //$english = $row[2];
                //$chapter = $row[3];

                $query = 'UPDATE `User` SET `tehillim_id` = '.$tehillimId.' WHERE `id` =  '. $userId;
                mysqli_query($bdd, $query);

                //Mark the assigned Tehillim as taken.
                $val = $this->actionMarkTehillimAsTaken($tehillimId);

                if($val) {
                    echo json_encode(array(
                                            "tehillim_id" => $tehillimId,
                                            "learning_id" => $tehillimId
                                           ));

                } else {
                    echo json_encode(array("status" => "random_tehillim_failure"));
                }
            }
        }
    }

    /*
     * Get a specific tehillim portion
     *
    public function actionGetTehillim($tehillimId)
    {
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            //$preferredLanguage = mysqli_real_escape_string($bdd, $preferredLanguage);

            //To avoid Hebrew characters encoding issues.
            mysqli_query($bdd, "SET NAMES 'utf8'");

            //$query = 'SELECT `tehillim_id`, `tehillim_content` FROM `TehillimHebrewVersion` WHERE `isTaken` != 1 ORDER BY RAND()';
            $query = 'SELECT `id`, `hebrew`, `english`, `chapter` FROM `Tehillim` WHERE `id` = ' .$tehillimId. ' ;';

            $result = mysqli_query($bdd, $query);
            $numRows = mysqli_num_rows($result);

            if ( $numRows > 0) {
                while ($row = mysqli_fetch_row($result)) {
                    $tehillimId = $row[0];
                    //$hebrew = $row[1];
                    //$english = $row[2];
                    //$chapter = $row[3];
                }

                //echo json_encode(array("tehillim_id" => $tehillimId, "tehillim_content" => $tehillimContent));
                echo json_encode(array("tehillim_id" => $tehillimId, "hebrew" => $hebrew, "english" => $english,
                    "chapter" => $chapter));

            } else {
                echo json_encode(array("status" => "get_tehillim_failure"));
            }
        }
    }*/


    /*
     * regrab tehillim (for account changes and updates)
    /
    public function regrabTehillim($userId)
    {
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            //$preferredLanguage = mysqli_real_escape_string($bdd, $preferredLanguage);

            //To avoid Hebrew characters encoding issues.
            mysqli_query($bdd, "SET NAMES 'utf8'");

            //$query = 'SELECT `tehillim_id`, `tehillim_content` FROM `TehillimHebrewVersion` WHERE `isTaken` != 1 ORDER BY RAND()';
            $query = 'SELECT `tehillim_id` FROM `User` WHERE `id` = ' .$userId. ' ;';
            $result = mysqli_query($bdd, $query);
            $tehillimId = mysqli_fetch_row($result)[0];



            $query = 'SELECT `id`, `hebrew`, `english`, `chapter` FROM `Tehillim` WHERE `id` = ' .$tehillimId. ' ;';
            $result = mysqli_query($bdd, $query);
            $numRows = mysqli_num_rows($result);

            if ( $numRows > 0) {
                while ($row = mysqli_fetch_row($result)) {
                    $tehillimId = $row[0];
                    $hebrew = $row[1];
                    $english = $row[2];
                    $chapter = $row[3];
                }
                //echo json_encode(array("tehillim_id" => $tehillimId, "tehillim_content" => $tehillimContent));
                echo json_encode(array("tehillim_id" => $tehillimId, "hebrew" => $hebrew, "english" => $english,
                     "chapter" => $chapter));

            } else {
                echo json_encode(array("status" => "regrab_tehillim_failure"));
            }
        }
    }*/

    public function actionMarkTehillimAsTaken($id)
    {
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'UPDATE Tehillim SET `isTaken` = 1 WHERE `id` = "'.$id.'"';
            $result = mysqli_query($bdd, $query);

            if ($result) {
                return true;
            } else {
                return false;
            }
        }
    }

    /*
    public function markTehillimNotTake($userId){
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'SELECT `tehillim_id` FROM `User` WHERE `id` = ' . $userId;
            $result = mysqli_query($bdd, $query);

            $tehillimId = mysqli_fetch_row($result)[0];

            $query = 'UPDATE Tehillim SET `isTaken` = `isTaken` - 1  WHERE `id` = ' . $tehillimId;
            mysqli_query($bdd, $query);
        }
    }*/



    /**
     * When the user complete the Tehillim portion.
     **/
    public function actionCompleteTehillimPortion($userId, $tehillimId) //todo remove userId
    {
        if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {

            //$query = 'UPDATE `Tehillim` SET `isTaken` = 0 WHERE `id` = '.$tehillimId.'; ';
            $query = 'UPDATE `Tehillim` SET `cycle_num` = `cycle_num` + 1 WHERE `id` = '.$tehillimId.'; ';
            $result = mysqli_query($bdd, $query);
            $query = 'UPDATE `User` SET `total_tehillim_completed` = `total_tehillim_completed` + 1 WHERE `id` = '.$userId.'; ';
            mysqli_query($bdd, $query);

            if ($result) {
                $this->actionUpdateLastCompletedTehillimDate($userId);
                echo json_encode(array("status" => "complete_tehillim_success"));
            } else {
                echo json_encode(array("status" => "complete_tehillim_failure"));
            }
        }
    }


    public function actionUpdateLastCompletedTehillimDate($userId)
    {
        if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'UPDATE `User` SET `last_completed_tehillim_date` = NOW() WHERE `id` = "'.$userId.'"';
            mysqli_query($bdd, $query);
        }
    }

    public function actionSetTehillimAssignedDate($userId)
    {
        if ($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
            $query = 'UPDATE `User` SET `last_assigned_tehillim_date` = NOW() WHERE `id` = "'.$userId.'"';
            mysqli_query($bdd, $query);
        }
    }
}

/**
 * Entry point of the API.
 **/
if(isset($_GET['method'])) {
    $method = $_GET['method'];
    $tehillim = new Tehillim();

    //Random method.
    if($method === 'random') {
        $userId = $_GET['userId'];

        $tehillim->actionAffectRandomTehillimPortion($userId);
    }

    /*Specific tehillim
    else if($method === 'get') {
        $tehillimId = $_GET['tehillimId'];
        $tehillim->actionGetTehillim((int) $tehillimId);
    }


    //regrab tehillim
    else if($method === 'regrab') {
        $userId = $_GET['userId'];

        $tehillim->regrabTehillim($userId);
    }*/

    //Complete method.
    else if($method === 'complete') {
        $userId = $_GET['userId'];
        $tehillimId = $_GET['tehillimId'];

        $tehillim->actionCompleteTehillimPortion((int)$userId, (int)$tehillimId);
    }

    /*/getCycleStatus method.
    else if($method === 'getCycleStatus') {
        $userId = $_GET['data'];

        $tehillim->actionGetCurrentCycleStatus((int)$userId);
    }*/

    //actionSetTehillimAssignedDate.
    else if($method === 'assignTehillimDate') {
        $userId = $_GET['data'];

        $tehillim->actionSetTehillimAssignedDate((int)$userId);
    }

}
