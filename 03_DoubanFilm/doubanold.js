var key="0a0a604697c5185a1e1f20d3c74f490e"
var root = "E:\\ServerFolders\\Video\\电影";
var pause_duration = 8000

var fso = new ActiveXObject("Scripting.FileSystemObject");
var shell = new ActiveXObject("WScript.Shell");
var req = new ActiveXObject("MSXML2.XMLHttp");
var doc = new ActiveXObject("MSXML2.DOMDocument");


// var log_file = fso.createTextFile(".\download.log");
var rollback = false;

find_files(root);

function find_files(path) {
	var folder = fso.GetFolder(path);
	
	var files = new Enumerator(folder.Files);
	var subfolders = new Enumerator(folder.SubFolders);
	
	var myfiles = new Array();
	for (;!files.atEnd(); files.moveNext()) {
		var file = files.item();
		myfiles.push(file.Name);
	}
	
	for (var n=0; n<myfiles.length; n++) {
		var mkv = path + "\\" + myfiles[n];
		process_file(path, mkv);
		if (rollback) n-=1;
	}
	
	
	
	for (;!subfolders.atEnd(); subfolders.moveNext()) {
		var subfolder = subfolders.item();
		if (subfolder.Name.substring(0,1) != ".") find_files(path + "\\" + subfolder.Name);
	}
}


function process_file(path, filename) {
	var extension = get_extension(filename).toLowerCase();
	
	if ((extension == "mkv") || (extension == "avi") || (extension == "rmvb") || (extension == "mp4") || (extension == "vob")) {
		
		var folder_name = get_foldername(path);
		var title = folder_name;
		if (folder_name.indexOf("[") > -1) {
			title = folder_name.substring(0,folder_name.indexOf("[")-1);
		}
		
		if (title.substring(title.length-1) == "1") {
			title = title.substring(0, title.length-1);
		}
		
		print("发现影片 ->" + title + "/" + get_original_title(filename));

		
		var save_to = filename.replace("." + extension, ".jpg");
		
		
		// 清理影片目录
		/*try {
			fso.deleteFile(path + "\\*.txt");
			fso.deleteFile(path + "\\*.doc");
			fso.deleteFile(path + "\\*.url");
		} catch (ex) {}
		
		
		if (fso.fileExists(save_to)) fso.deleteFile(path + "\\*.jpg");
		if (fso.fileExists(save_to.replace(".jpg",".tbn"))) fso.deleteFile(save_to.replace(".jpg",".tbn"));
		if (fso.fileExists(save_to.replace(".jpg",".nfo"))) fso.deleteFile(save_to.replace(".jpg",".nfo"));
		*/
		
		if (fso.fileExists(save_to)) {
			print("此影片已有海报，已忽略！");
			if (!fso.fileExists(save_to.replace(".jpg",".tbn"))) {
				fso.copyFile(save_to,save_to.replace(".jpg",".tbn"));
				print("已添加 XBMC 专用封面");
			}
			print("=========================================================");
			return;
		} else {
			if (!download_info(get_original_title(filename), save_to)) {
				download_info(title, save_to);
			}
			WScript.sleep(pause_duration);
		}
		


		
	}
}


function download_info(title, save_to) {

	var url = "http://api.douban.com/v2/movie/search?q=" + encodeURIComponent(title) + "&apikey=" + key;
	
	print("正在豆瓣网搜索影片信息 -> " + title);
	

	req.open("GET", url, false);
	req.send();
	msg = "";
	
	try {	
		var msg = eval("(" + req.responseText + ")");
		
		if (msg.code) {
			if (msg.code == "1998"){
				pause_duration = pause_duration * 2;
				if (pause_duration > 65535) pause_duration = 65535;
				print("访问豆瓣的速度已经超过了服务器限制！降低访问频率到 " + (pause_duration/1000) + " 秒\/次");

				rollback = true;
				return;
				
			} else {
				pause_duration = original_duration;
				rollback = false;
			}
		}
		
		if (msg.subjects) {
		
			// 下载封面
			var poster = msg.subjects[0].images.large;
			if (poster == "") poster = msg.subjects[0].images.medium;
			if (poster == "") poster = msg.subjects[0].images.small;
			if (poster != "") {
				print("发现海报 -> " + poster + " 开始下载");
				shell.run('wget "' + poster + '" -O "' + save_to + '"', true);
				print("已下载plex/xbmc专用封面");
			} else {
				print("没有找到海报");
				print("---------------------------------------------------------");
			}
			
			// 生成nfo文件
			var nfo_file = save_to.replace(".jpg",".nfo");
			
			var rating, year, plot, genre;
			year = msg.subjects[0].year;
			rating = msg.subjects[0].rating.average;
			id = msg.subjects[0].id;
			for (var n=0; n < msg.subjects[0].genres.length; n++) genre += msg.subjects[0].genres[n] + " ";
			
			var url1 = "http://api.douban.com/v2/movie/subject/" + id + "?apikey=" + key;
			req.open("GET", url1, false);
			req.send();
			
			var msg1 = eval("(" + req.responseText + ")");
			plot = msg1.summary
			
			doc.loadXML("<?xml version=\"1.0\" encoding=\"utf-8\" ?><movie />");
			var movie = doc.documentElement;
			add_node(doc, movie, "title", title);
			add_node(doc, movie, "rating", rating);
			add_node(doc, movie, "year", year);
			add_node(doc, movie, "plot", plot);
			add_node(doc, movie, "genre", genre.replace("undefined",""));
			
			for (var n=0; n < msg.subjects[0].casts.length; n++) {
				var actor = add_node(doc, movie, "actor", "");
				add_node(doc, actor, "name", msg.subjects[0].casts[n].name);
				
			}
			
			
			doc.save(nfo_file);
			print("已生成XBMC专用nfo文件");
			
			fso.copyFile(save_to, save_to.replace(".jpg",".tbn"));
			
			print("=========================================================");
			return true;
			
		} else {
			print("豆瓣中找不到此影片")
			print("-------------------------------------------------------");
			return false;
		}
	} catch (ex) { return false;}
	
}

function get_extension(filename) {
	var parts = filename.split(".");
	return parts[parts.length-1];
}

function get_original_title(filename) {
	var d = new Date();
	var parts = filename.split("\\");
	var name = parts[parts.length-1];
	
	if (name.substring(0,1) == "[") {
		name = name.substring(name.indexOf("]") + 2);
	}
	
	parts = name.split(".");
	var original_title = "";
	for (var n=0; n<parts.length; n++) {
		try {
			var str = parts[n].toLowerCase();
			if ((str == "bdrip") || (str == "720p") || (str == "1080p") || (str == "hr-hdtv")) break;
			var test = parseInt(parts[n]);
			if ((test > 1950) && (test <= d.getYear())) {
				break;
			} else {
				original_title += " " + parts[n];
			}
		} catch (ex) {}
		
	}
	
	return original_title;
}

function get_foldername(path) {
	var parts = path.split("\\");
	return parts[parts.length - 1];
}

function print(text) {
	WScript.Echo(text);
	// log_file.writeLine(text);
}

function add_node(doc, parent, node_name, node_text) {
	var node = doc.createElement(node_name);
	node.text = node_text;
	parent.appendChild(node);
	return node;
}