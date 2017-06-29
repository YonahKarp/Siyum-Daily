<?php

/**
 * Author: KOORYS LTD By Nizar BOUSEBSI
 * Project: My Mishna.
 * Description: Fetch the static pages from the database.
 * Customer: LEZAM - Elliot Schwartz.
 * Version: 1.0
 **/
require_once('config.php');

class StaticPages
{
  /**
   * Fetch the static page by title.
   **/
  public function getStaticpage($title)
  {
     if($bdd = mysqli_connect(_BDD_HOST_, _BDD_USERNAME_, _BDD_PASSWORD_, _BDD_NAME_)) {
      $title = mysqli_real_escape_string($bdd, $title);
      $query = 'SELECT `content` FROM `StaticPage` WHERE `title` LIKE "%'.$title.'%"';
      $result = mysqli_query($bdd, $query);

      if ($result->num_rows > 0) {
       while ($row = mysqli_fetch_row($result)) {
         $static = $row[0];
       }
       echo json_encode(array("static" => $static));
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
  $static = new StaticPages();

  //getStaticpage method.
  if($method === 'getStaticPage') {
    $title = $_GET['data'];

    $static->getStaticpage($title);
  }
}
