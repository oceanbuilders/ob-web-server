$('.cotainer').ready(function () {
	addLog();
});


function addLog() {

	var settings = {
        "url": `/v1/logs/get`,
		"method": "GET",
		"timeout": 0,
	};

	$.ajax(settings).done(function (response) {

		$.each(response, function (idx, obj) {
            let content = 
            `<tr>
                <th scope="row">${idx+1}</th>
                <td>${obj.timestamp}</td>
                <td>${obj.level}</td>
                <td>${obj.message}</td>
            </tr>`;

			$("#log").append(content);
		})

	});
}