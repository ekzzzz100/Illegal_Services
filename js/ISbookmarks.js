import '/Illegal_Services/plugins/DOMPurify-3.0.6/purify.min.js';

document.addEventListener("DOMContentLoaded", function() {
  const htmlSearchLinkInput = document.getElementById('search-link-input');
  const htmlSearchLinkButton = document.getElementById('search-link-button');
  const htmlRequestLinkInput = document.getElementById('request-link-input');
  const htmlRequestLinkButton = document.getElementById('request-link-button');
  const htmlISbookmarksDynamicContainer = document.getElementById('is-bookmarks-dynamic-container');

  let bookmarkDb;
  let previous_request;

  htmlSearchLinkInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      initializeSearchOrRequest("Search");
    }
  });
  htmlRequestLinkInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      initializeSearchOrRequest("Request");
    }
  });
  htmlSearchLinkButton.addEventListener('click', function() {
    initializeSearchOrRequest("Search");
  });
  htmlRequestLinkButton.addEventListener('click', function() {
    initializeSearchOrRequest("Request");
  });


  async function initializeSearchOrRequest(type) {

    if (!bookmarkDb) {
      bookmarkDb = await fetchISdatabase();
    }

    if (type === "Search") {
      handleSearch(bookmarkDb);
    } else if (type === "Request") {
      handleRequest(bookmarkDb);
    }
  }


  async function handleSearch(bookmarkDb) {

    const _ = sanitizeString(htmlSearchLinkInput.value)
    const formatedUserSearch = stripNewlinesAndWhitespace(htmlSearchLinkInput.value);
    const formatedUserSearchLowerCase = formatedUserSearch.toLowerCase();

    const foldersResults = [];
    const linksResults = [];

    let htmlOutput = "";

    await processDatabase(bookmarkDb, entry => {
      if (entry.type === 'FOLDER') {
        if (entry.title.toLowerCase().includes(formatedUserSearchLowerCase)) {
          foldersResults.push({
            path: formatPathLink(entry.path.slice(0, -1)),
            title: encodeHtmlEntityEncoding(entry.title)
          });
        }
      } else if (entry.type === 'LINK') {
        if (entry.title.toLowerCase().includes(formatedUserSearchLowerCase) || entry.url.toLowerCase().includes(formatedUserSearchLowerCase)) {
          linksResults.push({
            path: formatPathLink(entry.path),
            title: encodeHtmlEntityEncoding(entry.title),
            url: formatLink(entry.url)
          });
        }
      }
    });

    if (DOMPurify.removed.length !== 0) {
      console.log(DOMPurify.removed);
      htmlOutput += `
        <hr>
        <h1>
            Nice try, hacker!
            <br>
            🕵️ Keep sprinkling your magic XSS dust, but this website's got a shield! 🛡️
            <br>
            😄😘😘
        </h1>
        <hr>`;

    } else {

      if (foldersResults.length === 0 && linksResults.length === 0) {
        htmlOutput += `
        <hr>
        <h1>Search: "<span id="formated-user-search"></span>" is not indexed in IS database.</h1>
        <hr>`;
      } else {
        htmlOutput = `
        <hr>
        <h1>Search: "<span id="formated-user-search"></span>" was found indexed in IS database, in location(s):</h1>
        <hr>
        <br>`;
      }

      if (foldersResults.length !== 0) {
        htmlOutput += `
        <table>
            <tbody>
                <tr>
                    <th>HREF</th>
                    <th>NAME</th>
                </tr>`;
        for (const entry of foldersResults) {
          htmlOutput += `
                <tr>
                    <td>${entry.path}</td>
                    <td>${entry.title}</td>
                </tr>`;
        }
        htmlOutput += `
            </tbody>
        </table>`;
        if (linksResults.length !== 0) {
          htmlOutput += `
        <br>`;
        }
      }

      if (linksResults.length !== 0) {
        htmlOutput += `
        <table>
            <tbody>
                <tr>
                    <th>HREF</th>
                    <th>LINK</th>
                    <th>NAME</th>
                </tr>`;
        for (const entry of linksResults) {
          htmlOutput += `
                <tr>
                    <td>${entry.path}</td>
                    <td>${entry.url}</td>
                    <td>${entry.title}</td>
                </tr>`;
        }
        htmlOutput += `
            </tbody>
        </table>
    `;
      }
    }

    htmlISbookmarksDynamicContainer.classList.remove('navigation');
    htmlISbookmarksDynamicContainer.classList.add('search');
    htmlISbookmarksDynamicContainer.innerHTML = htmlOutput;

    const element = document.getElementById('formated-user-search');
    if (element) {
      element.textContent = formatedUserSearch;
    }

  }

  async function handleRequest(bookmarkDb) {

    const _ = sanitizeString(htmlRequestLinkInput.value)
    const formatedUserRequest = stripNewlinesAndWhitespace(htmlRequestLinkInput.value);
    const formatedUserRequestLowerCase = formatedUserRequest.toLowerCase();
    const formatedUserRequestLink = formatUserInputToURL(formatedUserRequest);

    const linksMatchResults = [];
    const linksContainsResults = [];

    let htmlOutput = "";

    await processDatabase(bookmarkDb, entry => {
      if (entry.type === 'LINK') {
        if (entry.url.toLowerCase().includes(formatedUserRequestLowerCase)) {
          if (entry.url.toLowerCase() === formatedUserRequestLowerCase) {
            linksMatchResults.push({
              path: formatPathLink(entry.path),
              title: encodeHtmlEntityEncoding(entry.title),
              url: formatLink(entry.url)
            });
          } else {
            linksContainsResults.push({
              path: formatPathLink(entry.path),
              title: encodeHtmlEntityEncoding(entry.title),
              url: formatLink(entry.url)
            });
          }
        }
      }
    });

    if (DOMPurify.removed.length !== 0) {
      console.log(DOMPurify.removed);
      htmlOutput += `
        <hr>
        <h1>
            Nice try, hacker!
            <br>
            🕵️ Keep sprinkling your magic XSS dust, but this website's got a shield! 🛡️
            <br>
            😄😘😘
        </h1>
        <hr>`;

    } else {

      htmlOutput += `
        <h1>
            <hr>
            Thank you for contributing to IS database!
            <br>
            We will manually review your request as soon as possible.
            <br>
            <hr>
        </h1>`;

      if (linksMatchResults.length === 0 && linksContainsResults.length === 0) {
        htmlOutput += `
        <div class="indexed-or-not">
            Link: "<a href="${encodeUrlEncoding(decodeUrlEncoding(formatedUserRequestLink))}"><span id="formated-user-request-1"></span></a>" was not indexed in IS database.
        </div>`;
      } else {
        if (linksMatchResults.length > 0) {
          htmlOutput += `
        <div class="indexed-or-not">
            Link: "<a href="${encodeUrlEncoding(decodeUrlEncoding(formatedUserRequestLink))}"><span id="formated-user-request-2"></span></a>" was already indexed in IS database, in location(s):
        </div>
        <br>
        <table>
            <tbody>
                <tr>
                    <th>HREF</th>
                    <th>LINK</th>
                    <th>NAME</th>
                </tr>`;
          for (const entry of linksMatchResults) {
            htmlOutput += `
                <tr>
                    <td>${entry.path}</td>
                    <td>${entry.url}</td>
                    <td>${entry.title}</td>
                </tr>`;
          }
          htmlOutput += `
            </tbody>
        </table>`;
          if (linksContainsResults.length !== 0) {
            htmlOutput += `
        <br>`;
          }
        }

        if (linksContainsResults.length > 0) {
          htmlOutput += `
        <div class="indexed-or-not">
            Link: "<a href="${encodeUrlEncoding(decodeUrlEncoding(formatedUserRequestLink))}"><span id="formated-user-request-3"></span></a>" was also found indexed in IS database, in location(s):
        </div>
        <br>
        <table>
            <tbody>
                <tr>
                    <th>HREF</th>
                    <th>LINK</th>
                    <th>NAME</th>
                </tr>`;
          for (const entry of linksContainsResults) {
            htmlOutput += `
                <tr>
                    <td>${entry.path}</td>
                    <td>${entry.url}</td>
                    <td>${entry.title}</td>
                </tr>`;
          }
          htmlOutput += `
            </tbody>
        </table>`;
          if (linksContainsResults.length !== 0) {
            htmlOutput += `
        <br>
    `;
          }
        }

      }
    }

    htmlISbookmarksDynamicContainer.classList.remove('navigation');
    htmlISbookmarksDynamicContainer.classList.add('request');
    htmlISbookmarksDynamicContainer.innerHTML = htmlOutput;

    const elementIds = ['formated-user-request-1', 'formated-user-request-2', 'formated-user-request-3'];
    elementIds.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = formatedUserRequest;
      }
    });

    if (previous_request === formatedUserRequestLowerCase) {
      return;
    }

    const headers = new Headers()
    headers.append("Content-Type", "application/json")

    const body = {
      "link": formatedUserRequest, // TODO: I can't see it in the email lmfao.. but why? would be nice to investigate that later.
      "html": htmlISbookmarksDynamicContainer.innerHTML // TODO: inject css in .innerHTML
    }

    const requestOptions = {
      method: "POST",
      headers,
      mode: "cors",
      body: JSON.stringify(body),
    }

    makeWebRequest("https://eowgt2c6txqik7b.m.pipedream.net", requestOptions)

    previous_request = formatedUserRequestLowerCase;

  }
});


/**
 * Set the IS bookmarks database in an array.
 * @async
 * @returns {Promise<Array>}
 */
async function fetchISdatabase() {
  const urlRawISDatabase = "/Illegal_Services/IS.bookmarks.json";

  const responseRawISDatabase = await makeWebRequest(urlRawISDatabase);
  if (!isResponseUp(responseRawISDatabase)) {
    throw new Error("Failed to retrieve the IS database.");
  }
  const responseText = (await responseRawISDatabase.text()).trim();

  let bookmarkDb;
  bookmarkDb = JSON.parse(responseText);

  if (
    (!Array.isArray(bookmarkDb))
    || (JSON.stringify(bookmarkDb[0]) !== '["FOLDER",0,"Bookmarks Toolbar"]') // Checks if the first array from the 'bookmarkDb' correctly matches the official IS bookmarks database
  ) {
    throw new Error("Invalid bookmark database");
  }

  return bookmarkDb;
}

/**
 * Function that parses the bookmark database and log each entries in a callback.
 * @async
 * @param {Array} bookmarkDb - The database that contains all the bookmarks to be created.
 * @param {Function} callback - The callback function to process each entry.
 * @returns {Promise<void>}
 */
async function processDatabase(bookmarkDb, callback) {
  const path = []

  for (const entry of bookmarkDb) {
    const [type, depth] = entry;

    if (path.length !== 0) {
      const depthToRemove = (path.length - depth);

      if (depthToRemove > 0) {
        path.splice(-depthToRemove);
      }
    }

    if (type === "FOLDER") {
      const title = decodeHtmlEntityEncoding(entry[2]);
      path.push(title);
      await callback({
        type: type,
        path: path,
        title: title,
        url: null
      });
    } else if (type === "LINK") {
      const title = decodeHtmlEntityEncoding(entry[3]);
      const url = entry[2];
      await callback({
        type: type,
        path: path,
        title: title,
        url: url

      });
    } else if (type === "HR") {
      await callback({
        type: type,
        path: path,
        title: null,
        url: null
      });
    }

  }

}

/**
 * Function that performs a web request using the Fetch API.
 * @async
 * @param {string} url - The URL to which the request should be made.
 * @param {Object} options - Optional request configuration options.
 * @returns {Promise<Response | undefined>} A promise that resolves with the HTTP response from the web request.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/fetch `fetch`} on MDN
 */
async function makeWebRequest(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    console.error("Web request error:", error);
  }
}

/**
 * Function that checks if an HTTP response indicates that a resource is UP.
 * @param {Response | undefined} response - The HTTP response to be checked. Can be undefined if the web request failed.
 * @returns {boolean} Returns `true` if the response indicates that the resource is UP; otherwise, returns `false`.
 */
function isResponseUp(response) {
  if (response === undefined) {
    return false;
  }

  if (response.ok) {
    return true;
  }

  return false;
}

function encodeUnicodeEncoding(string) {
  const replacements = {
    '\\': 'U+005C',
    '/': 'U+002F',
    ':': 'U+003A',
    '*': 'U+002A',
    '?': 'U+003F',
    '"': 'U+0022',
    '<': 'U+003C',
    '>': 'U+003E',
    '|': 'U+007C',
  };
  for (const chars in replacements) {
    const replacement = replacements[chars];
    string = string.split(chars).join(replacement);
  }
  return string;
}

function decodeUnicodeEncoding(string) {
  const replacements = {
    'U+005C': '\\',
    'U+002F': '/',
    'U+003A': ':',
    'U+002A': '*',
    'U+003F': '?',
    'U+0022': '"',
    'U+003C': '<',
    'U+003E': '>',
    'U+007C': '|',
  };
  for (const chars in replacements) {
    const replacement = replacements[chars];
    string = string.split(chars).join(replacement);
  }
  return string;
}

function encodeHtmlEntityEncoding(string) {
  const replacements = {
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '<': '&lt;',
    '>': '&gt;',
    ' ': '&nbsp;',
  };
  for (const chars in replacements) {
    const replacement = replacements[chars];
    string = string.split(chars).join(replacement);
  }
  return string;
}

function decodeHtmlEntityEncoding(string) {
  const replacements = {
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': '\'',
    '&lt;': '<',
    '&gt;': '>',
  };
  for (const chars in replacements) {
    const replacement = replacements[chars];
    string = string.split(chars).join(replacement);
  }
  return string;
}

function encodeUrlEncoding(string) {
  const replacements = {
    '%': '%25',
    ' ': '%20',
    '[': '%5B',
    ']': '%5D',
    '{': '%7B',
    '}': '%7D',
    '^': '%5E',
    '`': '%60',
    '#': '%23',
  };
  for (const chars in replacements) {
    const replacement = replacements[chars];
    string = string.split(chars).join(replacement);
  }
  return string;
}

function decodeUrlEncoding(string) {
  const replacements = {
    '%25': '%',
    '%20': ' ',
    '%5B': '[',
    '%5D': ']',
    '%7B': '{',
    '%7D': '}',
    '%5E': '^',
    '%60': '`',
    '%23': '#',
  };
  for (const chars in replacements) {
    const replacement = replacements[chars];
    string = string.split(chars).join(replacement);
  }
  return string;
}

function sanitizeString(str) {
  return DOMPurify.sanitize(str, { USE_PROFILES: { html: true } });
}

function stripNewlinesAndWhitespace(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

function formatLink(link) {
  const href_link = encodeUrlEncoding(decodeUrlEncoding(link));
  const text_link = encodeHtmlEntityEncoding(decodeHtmlEntityEncoding(link));
  return `<a href="${href_link}">${text_link}</a>`;
}

function formatPathLink(pathArray) {
  const href_link = encodeUrlEncoding(decodeUrlEncoding(pathArray.map(item => encodeUnicodeEncoding(item)).join('/')));
  const text_link = encodeHtmlEntityEncoding(decodeHtmlEntityEncoding(pathArray.join('/')));
  return `<a href="/Illegal_Services/${href_link}/index.html">${text_link}</a>`;
}

function formatUserInputToURL(userInput) {
  if (userInput.startsWith("http://") || userInput.startsWith("https://")) {
    return userInput;
  } else {
    return `http://${userInput}`;
  }
}
