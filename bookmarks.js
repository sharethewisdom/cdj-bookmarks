/**
$.extend($.scrollTo.defaults, {
  axis: 'y',
  interrupt: true,
  duration: 1,
  offset: { top:-300, left:0 }
});
**/

$(function() {
  /**
   * Store keycodes
   */
  const ENTER    = 13;
  const ESC      = 27;
  const HOME     = 36;
  const END      = 35;
  const INS      = 45;
  const LEFT     = 37;
  const UP       = 38;
  const RIGHT    = 39;
  const DOWN     = 40;
  const VI_G     = 71;
  const VI_INS   = 73;
  const VI_LEFT  = 72;
  const VI_UP    = 75;
  const VI_RIGHT = 76;
  const VI_DOWN  = 74;

  function updateTitle() {
    var count  = $("#bookmarks>li").filter(":visible").length;
    var plural = (( count == 0 ) || ( count > 1 ) ) ? 's' : '';
    var num_items = $("#num_items");
    num_items.empty().append("showing " + count + " link" + plural);
  }

  /**
    collect each distinct tag, strip whitespace, and place into sorted order.
   */
  function populateTags() {
    var tags = {};
    $("#bookmarks>li").each( function() {
      var tag = $(this).attr("title");
      if ( typeof tag !== 'undefined' ) {
        if ( tag.match( "," ) ) {
          var a = tag.split( "," );
          for ( i in a ) {
            var nm = a[i];
            nm = nm.replace(/(^\s+|\s+$)/g,'');
            tags[ nm.toLowerCase() ] = 1;
          }
        }
        else {
          tag = tag.replace(/(^\s+|\s+$)/g,'');
          tags[tag.toLowerCase()]= 1;
        }
      }
    });
    var keys = [];
    for( var t in tags ) {
      keys.push( t );
    }
    keys.sort();
    for ( t in keys ) {
      if (keys[t]) {
        $("#autotags").append(
            "<a class=\"tagfilter\" tabindex=\"-1\"  aria-checked=\"false\" href=\"#" 
            + escape(keys[t]) + "\">" + keys[t] + "</a> "
            );
      } else {
        $("#autotags").append("<a class=\"tagfilter selected\" tabindex=\"0\" aria-checked=\"true\" href=\"#\">all</a> ");
      }
    }
    $("#autotags").html( $("#autotags").html().replace( /, $/, '.' ) );
  }

  function appendTags() {
    $("#bookmarks>li").each( function() {
      var tag = $(this).attr("title");
      if ( typeof tag !== 'undefined' ) {
        var txt = '<div class="tags">';
        var array = tag.toLowerCase().split( "," );
        for ( i in array ) {
          var nm = array[i];
          nm = nm.replace(/(^\s+|\s+$)/g,'');
          txt += "<a class=\"tagfilter\" href=\"#" + escape(nm) + "\">" + nm + "</a> ";
        }
        txt = txt.replace( /, $/, "" );
        $(this).append( txt + "</div>" );
      }
    });
  }

  function updateTagfilterTabindex() {
    $("#autotags a.selected").attr('aria-checked', true);
    $("#autotags a.selected").attr('tabindex', '0');
    $("#autotags a:not(.selected)").attr('aria-checked', false);
    $("#autotags a:not(.selected)").attr('tabindex', '-1');
  }

  function updateSelection() {
    // if there's no selction, select the first visible bookmark
    if ( $("#sel").length == 0 ) $("#bookmarks>li:first-child:visible").attr("id","sel");
    // if the selection is hidden, clear it and get a nearby visible sibling
    if ( $("#sel").is(":hidden") ) {
      var prev = $("#sel").prevAll(":visible");
      var next = $("#sel").nextAll(":visible");
      $("#sel").removeAttr('id')
      if      ( prev.length == 1 ) prev.last().attr("id","sel");
      else if ( next.length == 1 ) next.first().attr("id","sel");
    }
  }

  function updateBookmarkTabindex() {
    if ($("#sel").length == 0) return;
    $("#bookmarks > li#sel").attr('aria-checked', true);
    $("#bookmarks > li#sel").attr('tabindex', '0');
    $("#bookmarks > li:not(#sel)").attr('aria-checked', false);
    $("#bookmarks > li:not(#sel)").attr('tabindex', '-1');
  }
  /**
   * take the anchor (aka hash) and use it as filter to show only entries with a given tag
   */
  window.onhashchange = function() {
    if (typeof window.location.hash !== 'string' || window.location.hash.length === 0) {
      $("#bookmarks>li").show();
      $("#autotags a").removeClass("selected");
      $("#autotags a").first().addClass("selected");
      updateTagfilterTabindex();
      updateTitle();
      return;
    }

    var tag = window.location.hash.substring(1);
    $("#autotags").children().each( function() {
      var key=$(this).html();
      if (tag == key) {
        $(this).addClass("selected");
      } else {
        $(this).removeClass("selected");
      }
    });

    $("#bookmarks>li").each( function() {
      var tags=$(this).attr('title');
      ( ( typeof tags !== 'undefined' ) && ( tags.toLowerCase().match(tag) ) )
        ? $(this).show() : $(this).hide() ;
    });

    updateSelection();
    updateTagfilterTabindex();
    updateBookmarkTabindex();
    updateTitle();
  }

  /**
   * Code that launches at page-load-time:
   */
  populateTags();
  appendTags();
  updateSelection();
  updateTagfilterTabindex();
  updateBookmarkTabindex();
  updateTitle();

  $("#fill").focus();
  $("#bookmarks").focusin( function(e) {
    /* $().slideDown({duration: 'slow', queue: false}); */
    console.log(e.type);
  });
  $("#fill").focusout( function(e) {
    console.log(e.type);
  });

  /**
   * Search by title/url - case insensitive.
   */
  $("#fill").keydown(function(e) {
    if (e.keyCode === ENTER) e.preventDefault();
    if (e.keyCode === ESC)   $("#fill").blur();
  });
  $("#fill").keyup(function(e) {
    filter = $("#fill").val().toLowerCase();
    $("#bookmarks>li").each( function(){
      var title=$(this).text().toLowerCase();
      var links=$(this).find("a");
      if ( typeof links !== 'undefined' ) {
        links = links.attr("href").toLowerCase();
      }
      ( title.match( filter ) || links.match(filter) || filter == "" )
        ? $(this).show() : $(this).hide();
    } );
    updateTitle();
  })

  /**
   * Show only entries with zero tags.
   */
  $('#untagged').click(function(e){
    e.preventDefault();
    $("#bookmarks>li").each( function() {
      var tags=$(this).attr('title');
      ( typeof tags !== 'undefined' ) ? $(this).hide() : $(this).show();
    });
    updateTitle();
  });

  /**
   * Toggle between a light and a dark colorscheme
   */
  $('#colorscheme').click(function(e){
    $('body').toggleClass('light dark');
  });

  /* $("#bookmarks>li").filter(":visible").mouseover(function() { */
  /*     $("#bookmarks>li").filter(":visible").removeClass("sel"); */
  /*     $(this).addClass("sel"); */
  /* }).click(function() { */
  /*   console.log($(this)); */
  /* }); */

  window.addEventListener('wheel', function(e) {
    let direction = "";
    e.preventDefault();
    if (e.deltaY < 0) {
      direction="backward"
      var prev = $("#sel").prevAll(":visible");
      $("#sel").removeAttr('id')
      if (prev.length<2) {
        $("#bookmarks>li:visible").last().attr("id","sel");
      } else {
        if (window.matchMedia('(max-width: 480px)').matches) {
          prev.first().attr("id","sel");
        } else {
          prev.eq(1).attr("id","sel");
        }
      }
      updateBookmarkTabindex();
    } else {
      var next = $("#sel").nextAll(":visible");
      $("#sel").removeAttr('id')
      if (next.length<2) {
        $("#bookmarks>li:visual").first().attr("id","sel");
      } else {
        if (window.matchMedia('(max-width: 480px)').matches) {
          next.first().attr("id","sel");
        } else {
          next.eq(1).attr("id","sel");
        }
      }
      updateBookmarkTabindex();
    }
  });

  $("#wrap").keydown(function(e) {
      if ( $("#fill").is(":focus") ) return;
      let direction = "";
      switch(e.keyCode) {
        case ENTER: {
          e.preventDefault();
          $("#sel>a")[0].click();
          break;
         };
        case INS:
        case VI_INS: {
          e.preventDefault();
          $("#fill").focus();
          break
        }
        case END: {
          direction="backward"
          e.preventDefault();
          $("#sel").removeAttr('id');
          $("#bookmarks>li:visible").last().attr("id","sel");
          break
        }
        case HOME: {
          direction="backward"
          e.preventDefault();
          $("#sel").removeAttr('id');
          $("#bookmarks>li:visible").first().attr("id","sel");
          break
        }
        case VI_G: {
          direction="backward"
          e.preventDefault();
          $("#sel").removeAttr('id')
          if (e.shiftKey) $("#bookmarks>li:visible").last().attr("id","sel");
          else $("#bookmarks>li:visible").first().attr("id","sel");
          break
         }
        case VI_UP:
        case UP: {
          e.preventDefault();
          direction="backward"
          if ($("#sel").length==0) $("#bookmarks>li:visible").last().attr("id","sel");
          var prev = $("#sel").prevAll(":visible");
          $("#sel").removeAttr('id')
          if (prev.length<2) {
            $("#bookmarks>li:visible").last().attr("id","sel");
            break
          } else {
            if (window.matchMedia('(max-width: 480px)').matches) {
              prev.first().attr("id","sel");
            } else {
              prev.eq(1).attr("id","sel");
            }
          }
          updateBookmarkTabindex();
          break;
        }
        case VI_LEFT:
        case LEFT: {
          e.preventDefault();
          direction="backward"
          if ($("#sel").length == 0) $("#bookmarks>li:visible").last().attr("id","sel");
          var prev = $("#sel").prevAll(":visible");
          $("#sel").removeAttr('id')
          if (prev.length===0) {
            $("#bookmarks>li:visible").last().attr("id","sel");
          } else {
            prev.first().attr("id","sel");
          }
          updateBookmarkTabindex();
          break;
        }
        case VI_RIGHT:
        case RIGHT: {
          e.preventDefault();
          direction="forward"
          if ($("#sel").length===0) $("#bookmarks>li:visible").last().attr("id","sel");
          var next = $("#sel").nextAll(":visible");
          $("#sel").removeAttr('id')
          if (next.length===0) {
            $("#bookmarks>li:visible").first().attr("id","sel");
          } else {
            next.first().attr("id","sel");
          }
          updateBookmarkTabindex();
          break;
        }
        case VI_DOWN:
        case DOWN: {
          e.preventDefault();
          direction="forward"
          if ($("#sel").length===0) $("#bookmarks>li:visual").last().attr("id","sel");
          var next = $("#sel").nextAll(":visible");
          $("#sel").removeAttr('id')
          if (next.length<2) {
            $("#bookmarks>li:visual").first().attr("id","sel");
          } else {
            if (window.matchMedia('(max-width: 480px)').matches) {
              next.first().attr("id","sel");
            } else {
              next.eq(1).attr("id","sel");
            }
          }
          updateBookmarkTabindex();
          break;
        }
      }
      // scrollTo plugin problem: 'interrupt: true' broken.
      // $("#wrap").scrollTo("#sel", 1000);
      // https://www.w3.org/Bugs/Public/show_bug.cgi?id=17152
    //**
      switch(direction) {
        case "forward": {
          if (typeof $("#sel")[0].scrollIntoViewIfNeeded !== "undefined") {
            $("#sel")[0].scrollIntoViewIfNeeded();
          } else {
            $("#sel")[0].scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
          }
          break;
        }
        case "backward": {
          if (typeof $("#sel")[0].scrollIntoViewIfNeeded !== "undefined") {
            $("#sel")[0].scrollIntoViewIfNeeded();
          } else {
            $("#sel")[0].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
          }
          break;
        }
      }
      //**/
    });
});

