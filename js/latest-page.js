const apiUrl = 'https://back.3blmedia.com/rest/report-announcement/latest-reports?page=';
const outputElement = document.getElementById('output-latest');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
let currentPage = sessionStorage.getItem('currentPage') ? parseInt(sessionStorage.getItem('currentPage')) : 0;
const postsPerPage = 5;

function fetchReports(page) {
  fetch(apiUrl + page)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      outputElement.innerHTML = '';

      if (data.results && data.results.length > 0) {
        data.results.slice(0, postsPerPage).forEach(report => {
          const reportUrl = `${baseurl}/latest-content.html?alias=${report["url-alias"]}`;
          let reportElement = document.createElement('div');
          reportElement.classList.add('report');
          reportElement.innerHTML = `
            <div class="mb-5 d-flex justify-content-between main-loop-card">
              <div class="pr-3">
                <h2 class="mb-1 h4 font-weight-bold">
                  <a class="text-dark report-link" href="${reportUrl}" data-id="${report["report_id"]}">${report["report-title"]}</a>
                </h2>
                <p class="excerpt">
                  ${report["report-intro"]}
                </p>
                <small class="text-muted">
                  ${report["published-date"]}
                </small>
              </div>
              <div class="col-md-3 pr-0 text-right">
                <a href="${reportUrl}" class="report-link" data-id="${report["report_id"]}">
                  <img src="${report["report-image"]}" alt="${report["report-title"]}">
                </a>
              </div>
            </div>
          `;
          outputElement.appendChild(reportElement);
          localStorage.setItem(`report_${report["url-alias"]}`, JSON.stringify(report));
        });
      } else {
        outputElement.textContent = 'No reports found.';
      }

      prevButton.disabled = page === 0;
      nextButton.disabled = data.results.length < postsPerPage;

      document.querySelectorAll('.report-link').forEach(link => {
        link.addEventListener('click', (event) => {
          const urlAlias = event.target.closest('.report-link').getAttribute('data-alias');
          localStorage.setItem('currentReportAlias', urlAlias);
        });
      });
    })
    .catch(error => {
      console.error('Error:', error);
      outputElement.textContent = 'An error occurred while fetching the data.';
    });
}

// Initial fetch of reports
fetchReports(currentPage);

prevButton.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    sessionStorage.setItem('currentPage', currentPage);
    fetchReports(currentPage);
  }
});

nextButton.addEventListener('click', () => {
  currentPage++;
  sessionStorage.setItem('currentPage', currentPage);
  fetchReports(currentPage);
});
