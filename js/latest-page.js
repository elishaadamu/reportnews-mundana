const apiUrl = 'https://back.3blmedia.com/rest/report-announcement/latest-reports?page=';
const outputElement = document.getElementById('output-latest');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const postContent = document.getElementById('post-content');
let currentPage = 0;
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
      data.results.slice(0, postsPerPage).forEach(report => {
        const reportUrl = `/reportnews-mundana${report["url-alias"]}`;
        
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
        localStorage.setItem(`report_${report["report_id"]}`, JSON.stringify(report));
      });

      prevButton.disabled = page === 0;
      nextButton.disabled = data.results.length < postsPerPage;

      document.querySelectorAll('.report-link').forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          const reportId = event.target.closest('.report-link').getAttribute('data-id');
          const reportUrl = event.target.closest('.report-link').getAttribute('href');
          history.pushState({ reportId: reportId }, null, reportUrl);
          showPostContent(reportId);
        });
      });
    })
    .catch(error => {
      console.error('Error:', error);
      outputElement.textContent = 'An error occurred while fetching the data.';
    });
}

function showPostContent(reportId) {
  const report = JSON.parse(localStorage.getItem(`report_${reportId}`));
  if (report) {
    outputElement.style.display = 'none';
    postContent.style.display = 'block';
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    postContent.innerHTML = `
      <div class="container">
        <div class="jumbotron jumbotron-fluid mb-3 pl-0 pt-0 pb-0 bg-white position-relative">
          <div class="h-100 tofront">
            <div class="row justify-content-between">
              <div class="col-md-7 pr-0 pr-md-4 pt-4 pb-4 align-self-center">
                <h3 class="display-4 mb-4 article-headline">${report["report-title"]}</h3>
                <p>Date Published: <strong>${report["published-date"]}</strong></p>
              </div>
              <div class="col-md-5 pr-0 align-self-center">
                <img class="rounded" src="${report["report-image"]}" alt="${report["report-title"]}">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container-lg pt-4 pb-4">
        <div class="row justify-content-center">
          <div class="col-lg-2 pr-4 mb-4 col-md-12">
            <div class="sticky-top sticky-top-offset text-center">
              <div class="text-muted">Share this</div>
              <br>
              <div class="share d-inline-block">
                <div class="a2a_kit a2a_kit_size_32 a2a_default_style" style="font-size: 20px;">
                  <a href="https://twitter.com/reportalert/"><i style="font-size: 40px;" class="fab fa-twitter"></i></a>
                  <br>
                  <a href="https://www.linkedin.com/groups/145633/"><i style="font-size: 40px;" class="fab fa-linkedin"></i></a>
                  <br>
                  <a href="https://www.instagram.com/3blmedia/"><i style="font-size: 40px;" class="fab fa-instagram"></i></a>
                  <br>
                  <a href="https://www.facebook.com/3BLMedia/"><i style="font-size: 40px;" class="fab fa-facebook"></i></a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-12 col-lg-8">
            <article class="article-post">${report["body"]}</article>
          </div>
        </div>
      </div>

      <a href="#" id="back-button" class="back-button">Back</a>
    `;

    document.getElementById('back-button').addEventListener('click', (event) => {
      event.preventDefault();
      outputElement.style.display = 'block';
      postContent.style.display = 'none';
      prevButton.style.display = 'block';
      nextButton.style.display = 'block';
      history.pushState(null, null, '/'); // Navigate back to the main page URL
    });
  } else {
    outputElement.innerHTML = 'Report not found.';
    outputElement.style.display = 'block';
    postContent.style.display = 'none';
    prevButton.style.display = 'block';
    nextButton.style.display = 'block';
  }
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.reportId) {
    showPostContent(event.state.reportId);
  } else {
    outputElement.style.display = 'block';
    postContent.style.display = 'none';
    prevButton.style.display = 'block';
    nextButton.style.display = 'block';
  }
});

// Check if there's a report ID in the URL on page load
const currentUrl = new URL(window.location.href);
const reportIdFromUrl = currentUrl.pathname.split('/').pop();
if (reportIdFromUrl && reportIdFromUrl.startsWith('reportnews-mundana')) {
  showPostContent(reportIdFromUrl.replace('reportnews-mundana', ''));
} else {
  fetchReports(currentPage);
}

prevButton.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    fetchReports(currentPage);
  }
});

nextButton.addEventListener('click', () => {
  currentPage++;
  fetchReports(currentPage);
});

fetchReports(currentPage);
