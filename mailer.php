<?php
    require_once('class.phpmailer.php');

    $to = $_GET["emailto"];
    $code = $_GET["code"];

    $mail = new PHPMailer;

    //$mail->SMTPDebug = 3;                               // Enable verbose debug output

    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->SMTPDebug  = 1;
    $mail->Host = 'smtp.sendgrid.net';//'smtp.gmail.com';  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = 'apikey';                 // SMTP username
    $mail->Password = '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';//'Islanders91';   //todo sendgrid (Qwerty718) ateresShimon // SMTP password
    $mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 587;                                    // TCP port to connect to

    $mail->setFrom('ateresShimon@gmail.com', 'Siyum Daily');
    $mail->addAddress($to);               // Name is optional


    $mail->isHTML(true);                                  // Set email format to HTML

    $mail->Subject = 'Siyum Daily email authentication code';
    $mail->Body    = '<center><h3> Thank you for signing up for siyum daily. Your authentication code is:  <br>  '. $code .'</h3></center>';
    $mail->AltBody = 'Thank you for signing up for siyum daily Your authentication code is: '. $code;

    if(!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent';
    }