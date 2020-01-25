const tableWrap = document.querySelector('.tableWrap');

const templateHeader = `
	<table width="100%" cellpadding="2">
		<tr>
		<th>Широта</th>
		<th>Долгота</th>
		<th>Скрость (км/ч)</th>
		<th>Курс (градусы)</th>
		<th>Высота полета (м)</th>
		<th>Аэропорт вылета</th>
		<th>Аэропорт назначения</th>
		<th>Номер рейса</th>
		</tr>
	</table>`;

class getData {
	fetch() {
		let data = fetch('https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48')
			.then((response) => {
				if (!response.ok) { console.log(response.status + ': ' + response.statusText); return;}
				response.json().then(data => createTable(data)).then(setTimeout(()=>this.fetch(),3000))
			})
			.catch((error) => console.log('error', error))
		return data;
	}
}

function renderTableRow(fieldData) {
	let [latitude, longitude, speed, track, height, departure, arrival, flightNum] = fieldData;
	const row = document.createElement('tr');
	flightNum === `Private jet` && row.classList.add('privateJet');
	height === `On the ground` && row.classList.add('onTheGround');
	row.innerHTML = `
		<td>${latitude}</td>
		<td>${longitude}</td>
		<td>${speed}</td>
		<td>${track}</td>
		<td>${height}</td>
		<td>${departure}</td>
		<td>${arrival}</td>
		<td>${flightNum}</td>`;
	return row;
};
function calcDist(plane) {
	let latitude = plane[1] * Math.PI / 180;
	let longitude = plane[2] * Math.PI / 180;
	return Math.acos(Math.sin(latitude) * Math.sin(55.41 * Math.PI / 180) + Math.cos(latitude) * Math.cos(55.41 * Math.PI / 180) * Math.cos(longitude - 37.902 * Math.PI / 180)) * 6371;
};

function createTable(data) {
	tableWrap.innerHTML = templateHeader;
	const table = document.querySelector('table');
	let airplanes = Object.values(data).sort((a, b) => calcDist(a) - calcDist(b));
	for (let plane of airplanes) {
		if (typeof plane[1] !== "undefined") {
			let fieldData = [plane[1], plane[2], Math.round(plane[5] * 1.852), plane[3], Math.round(plane[4] * 0.3048) || `On the ground`, plane[11] || `N/A`, plane[12] || `N/A`, plane[13] || `Private jet`];
			table.appendChild(renderTableRow(fieldData));
		}
	}
};
const dataFromAPI = new getData;
dataFromAPI.fetch();