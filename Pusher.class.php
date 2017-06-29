<?php

/**
 * Author: KOORYS LTD By Nizar BOUSEBSI
 * Project: My Mishna.
 * Description: This is the Pusher Notification System.
 * Customer: LEZAM - Elliot Schwartz.
 * Version: 1.0
 **/

require_once __DIR__.'/vendor/autoload.php';

class PusherSystem
{
  public function sendPushNotificationToAllUsers()
  {
    $options = array(
      'encrypted' => true
    );

    $pusher = new Pusher(
      '90a3fafd3e066540710b',
      '96e21f1573f39ab66811',
      '191778',
      $options
    );

    $data['message'] = 'Reminder: Learn your Mishna!';
    $pusher->trigger('mishna_channel', 'mishna_events', $data);
  }

}

$PusherSys = new PusherSystem();

$PusherSys->sendPushNotificationToAllUsers();
