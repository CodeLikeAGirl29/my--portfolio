<?
$mail_to = "lindseykdev@gmail.com";
$mail_from = "webmaster@example.com";


$name = strip_tags(trim($_POST['name']));
$email = strip_tags(trim($_POST['email']));
$subject = strip_tags(trim($_POST['subject']));
if($subject!='') $mail_subject = $subject;
else $mail_subject = 'Contact form';
$text = strip_tags(trim($_POST['message']));

$message = "<h3>CONTACT FORM WAS SUBMITTED</h3>"."<br>";
$message .= "<b>Name:</b> ".$name."<br>";
$message .= "<b>Email:</b> ".$email."<br>";
$message .= "<b>Message:</b> ".$text."<br>";

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

// More headers
$headers .= "From: <".$mail_from.">" . "\r\n";

mail($mail_to,$mail_subject,$message,$headers);
?>