<?php
	session_start();

	require('db.php');
	
	//Connect to database and query for User
	$conn = mysqli_connect($host, $user, $pass, $db)
		or die("Could not connect to database. Please try again later.");
	$sql = "SELECT username FROM Users WHERE username = '".$_POST['username']."'";
	$result = mysqli_query($conn, $sql)
		or die("Query couldn't find ".$_POST['username']);
	$num = mysqli_num_rows($result);
	//User found, check password.
	if($num > 0)
	{
		$sql2 = "SELECT username FROM Users WHERE username = '".$_POST['username']."'
				AND password='".$_POST['password']."'";
		$result2 = mysqli_query($conn, $sql2)
				or die("query failed");
		$num2 = mysqli_num_rows($result2);
		
		//Password matches, login user.
		if($num2 > 0)
		{
			$_SESSION['auth'] = "yes";
			$_SESSION['loginName'] = $_POST['username'];
			
			header("Location: ../admin.html");
			exit();
		}
		//Password wrong, user taken to login page.
		else
		{
			header( "refresh:0.02;url=../login.html" );
			echo '<script type="text/javascript">alert("Incorrect password!")</script>';
			exit();
		}
	}
	//User not found. 
	else
	{
		$_SESSION['auth'] = "no";
		header( "refresh:0.02;url=../login.html" );
		echo '<script type="text/javascript">alert("Username does not exist!")</script>';
		exit();
	}
?>