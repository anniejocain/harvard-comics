<?php 

$isbn = $_GET['isbn'];
$url = "http://www.librarything.com/api/whatwork.php?isbn=" . $isbn;
$contents = fetch_page($url);
	
$wxml = new SimpleXmlElement($contents, LIBXML_NOCDATA); 
	
//print_r($pxml);
	
$work = $wxml->work;

$url = "http://www.librarything.com/services/rest/1.1/?method=librarything.ck.getwork&id=$work&apikey=APIKEY";

$json = array();

	
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$contents = curl_exec ($ch);
	
curl_close ($ch);
	
$xml = simplexml_load_string($contents);

$fields = $xml->ltml->item->commonknowledge->fieldList->field;
    $length = count($fields);
    //echo $length;
    for($i = 0; $i < $length; $i++) {
        if($xml->ltml->item->commonknowledge->fieldList->field[$i]['name'] == 'characternames') {
            $characters = array();
            foreach($xml->ltml->item->commonknowledge->fieldList->field[$i]->versionList->version->factList->fact as $character) {
                array_push($characters, (string) $character[0]);
            }
            $json['characters'] = $characters;
        }
        
        if($xml->ltml->item->commonknowledge->fieldList->field[$i]['name'] == 'awards') {
            $awards = array();
            foreach($xml->ltml->item->commonknowledge->fieldList->field[$i]->versionList->version->factList->fact as $award) {
                array_push($awards, (string) $award[0]);
            }
            $json['awards'] = $awards;
        }
    }


header('Content-type: application/json');
echo json_encode($json); 



function fetch_page($url) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL,
	$url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$contents = curl_exec ($ch);
	
	curl_close ($ch);
	
	return $contents;
}


/*
$(xml).find("field").each(function()
  {
    if($(this).attr('type') === '3'){
    	var list = '';
    	$(this).find("fact").each(function() {	
    		var charname = $(this).text();
    		list += '<li>' + charname + '</li>';
    	});
    	$('#works').append('<p>Characters</p><ul>' + list + '</ul>');
    }
    else if($(this).attr('type') === '2'){
    	var list = '';
    	$(this).find("fact").each(function() {	
    		var placename = $(this).text();
    		placename = placename.replace('(Fictional)', ' ');
    		list += '<li>' + placename + '</li>';
    	});
    	$('#works').append('<p>Locations</p><ul>' + list + '</ul>');
    }
    else if($(this).attr('type') === '34'){
    	var list = '';
    	$(this).find("fact").each(function() {	
    		var eventname = $(this).text();
    		list += '<li>' + eventname + '</li>';
    	});
    	$('#works').append('<p>Events</p><ul>' + list + '</ul>');
    }
    else if($(this).attr('type') === '23'){
    	var list = '';
    	$(this).find("fact").each(function() {	
    		var seriesname = $(this).text();
    		list += '<li>' + seriesname + '</li>';
    	});
    	$('#works').append('<p>Series</p><ul>' + list + '</ul>');
    }
  });
*/  
?>