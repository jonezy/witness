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

  var interval = 5 * 60000; // 5 mins
  update(function() {
    t = window.setInterval(function() { update(checkRows); }, interval);
    checkRows();
  });

  resetMessagesUI();

  window.onresize = function() {
    w = $('.container16').width(); 
    resetMessagesUI();
  };
});

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
      cb && cb();
    },

    error: function(xhr, status, errorText) {
      notify('There was a problem checking the sites. Reload the page to try again.', 'alert alert-error');
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
