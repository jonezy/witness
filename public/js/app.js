var t;
var m = $('#messages'),
    w = $('.container16').width(); 

$(function() {

  Tinycon.setOptions({
    width: 7,
    height: 9,
    font: '10px arial',
    colour: '#ffffff',
    background: '#e74c3c',
    fallback: true
  });

  update(function() {
    t = window.setInterval(update(checkRows), 60000);
    checkRows();
  });

  resetMessagesUI();

  window.onresize = function() {
    w = $('.container16').width(); 
    resetMessagesUI();
  };
});


var logs = [];

function update(cb) {
  var el = $('#domains');

  $.ajax({
    url: "/update",
    type: "GET",
    dataType: "text",
    contentType: "application/text",
    cache: false,
    beforeSend: function() {
      el.addClass('loading');
      notify('Checking sites....', 'alert alert-info');
    },
    complete: function() {
      el.removeClass('loading');
    },

    success: function(data) {
      hide($('#messages'));
      el.html(data);
      logs[logs.length + 1] = { message: "Successfully ran @ " + new Date().toLocaleTimeString(), status: 'info'};
      displayLogs(); 
      cb && cb();
    },

    error: function(xhr, status, errorText) {
      notify('There was a problem checking the sites. Reload the page to try again.', 'alert alert-error');
      logs[logs.length + 1] = { message: "Failed run @ " + new Date().toLocaleTimeString(), status: 'error'};
      displayLogs();
      console.log('process error', errorText);
    }
  });
}

function checkRows() {
  var down = 0;
  $('#domain-table tr').each(function(i,r) {
    if($(this).attr('class').indexOf('error') > -1) down++;
  });
  Tinycon.setBubble(down);
}

function displayLogs() {
  var ui = $('#logs'),
      itemTemplate = '<p class="alert alert-<status>"><msg></p>';

  ui.html('');
  for(var log in logs) {
    var entry = itemTemplate.replace('<msg>',logs[log].message); 
    entry = entry.replace('<status>',logs[log].status); 
    $('#logs').append(entry);
  }
}

function resetMessagesUI() {
  if(m.width() >= w) {
    m.width(m.width() - 70);
  } else {
    m.width(w);
  }
}

function hide(el) {
 el.hide(); 
}

function notify(message, css) {
  var notifier = $('#messages');
  notifier.removeClass();
  notifier.addClass(css);
  notifier.html(message);
  notifier.show();
}
