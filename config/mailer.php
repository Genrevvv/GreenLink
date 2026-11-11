<?php

use PHPMailer\PHPMailer\PHPMailer;

// Load PHPMailer through Composer.
require_once ROOT . '/vendor/autoload.php';

// Load private email configuration.
$mailConfig = require ROOT . '/config/mail.php';

// Create a PHPMailer instance.
$mail = new PHPMailer(true);

// Configure SMTP.
$mail->isSMTP();
$mail->Host = $mailConfig['host'];
$mail->SMTPAuth = true;
$mail->Username = $mailConfig['username'];
$mail->Password = $mailConfig['password'];
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = $mailConfig['port'];

// Configure sender.
$mail->setFrom(
    $mailConfig['from_email'],
    $mailConfig['from_name']
);

// Configure email content.
$mail->isHTML(true);
$mail->CharSet = 'UTF-8';

// Return the configured mailer.
return $mail;

?>
