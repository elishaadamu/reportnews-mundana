const apiUrl = 'https://back.3blmedia.com/rest/report-announcement/latest-reports?page=0';
const outputElement = document.getElementById('output-latest');

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Clear the output element
    outputElement.innerHTML = '';

    // Display data in HTML elements
    data.results.forEach(report => {
      let reportElement = document.createElement('div');
      reportElement.classList.add('report');
      reportElement.innerHTML = `
      
      <div class="mb-5 d-flex justify-content-between main-loop-card">
    <div class="pr-3">
        <h2 class="mb-1 h4 font-weight-bold">
          <a class="text-dark" href="https://back.3blmedia.com${report["url-alias"]}">${report["report-title"]}</a>
        </h2>
        <p class="excerpt">
          ${report["report-intro"]}
        </p>
        
        <small class="text-muted">
            ${report["published-date"]}
        </small>
    </div>

        <div class="col-md-3 pr-0 text-right">
        <a href="{{site.baseurl}}{{post.url}}">
        <img src="${report["report-image"]}" alt="${report["report-title"]}">
        </a>
        </div>

    </div>
      `;
      outputElement.appendChild(reportElement);
    });
  })
  .catch(error => {
    console.error('Error:', error);
    outputElement.textContent = 'An error occurred while fetching the data.';
  });
