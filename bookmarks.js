  $(function() {

    function updateTitle()
    {
      var count  = $("#bookmarks").children().filter(":visible").size();
      var plural = (( count == 0 ) || ( count > 1 ) ) ? 's' : '';
      var count = $("#num_items");
      count.empty().append("showing " + count + " link" + plural);
    }

    function sortBookmarks()
    {
      var mylist = $('#bookmarks');
      var listitems = mylist.children('li').get();
      listitems.sort(function(a, b) {
        return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
      });
      $.each(listitems, function(idx, itm) { mylist.append(itm); });
    }


    /**
      collect each distinct tag,
      strip whitespace, and place
      into sorted order.
     */
    function populateTags()
    {
      var tags = {};
      $("#bookmarks").children().each( function() {
        var tag = $(this).attr("title");
        if ( typeof tag !== 'undefined' )
        {
          if ( tag.match( "," ) )
          {
            var a = tag.split( "," );
            for ( i in a )
            {
              var nm = a[i];
              nm = nm.replace(/(^\s+|\s+$)/g,'');
              tags[ nm.toLowerCase() ] = 1;
            }
          }
          else
          {
            tag = tag.replace(/(^\s+|\s+$)/g,'');
            tags[tag.toLowerCase()]= 1;
          }
        }
      });
      var keys = [];
      for( var t in tags )
      {
        keys.push( t );
      }
      keys.sort();
      for ( t in keys )
      {
        if (keys[t]) {
          $("#autotags").append(
              "<a class=\"tagfilter\" href=\"#" 
              + escape(keys[t]) + "\">" + keys[t] + "</a> "
              );
        } else {
          $("#autotags").append("<a class=\"tagfilter\" href=\"#\">all</a> ");
        }
      }
      $("#autotags").html( $("#autotags").html().replace( /, $/, '.' ) );
    }

    function appendTags()
    {
      $("#bookmarks").children().each( function() {
        var tag = $(this).attr("title");
        if ( typeof tag !== 'undefined' )
        {
          var txt = '<div class="tags">';
          var array = tag.toLowerCase().split( "," );
          for ( i in array )
          {
            var nm = array[i];
            nm = nm.replace(/(^\s+|\s+$)/g,'');
            txt += "<a class=\"tagfilter\" href=\"#" + escape(nm) + "\">" + nm + "</a> ";
          }
          txt = txt.replace( /, $/, "" );
          $(this).append( txt + "</div>" );
        }
      });
    }


    /**
     * Code that launches at page-load-time:
     */

    /** Sort the bookmarks */
    sortBookmarks();

    /** Populate the tags pane. */
    populateTags();

    /** Append the tags beneath each bookmark. */
    appendTags();

    // Focus on the search/filter box.
    $("#fill").focus();



    /**
     * Bind event handlers...
     */
    /**
     * take the anchor (aka hash) and use it as filter to
     * show only entries with a given tag
     */
    window.onhashchange = function() {
      if (typeof window.location.hash !== 'string' || window.location.hash.length === 0)
      {
        $("#bookmarks").children().each( function() {
          $(this).show();
        });
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
      $("#bookmarks").children().each( function() {
        var tags=$(this).attr('title');
        ( ( typeof tags !== 'undefined' ) && ( tags.toLowerCase().match(tag) ) )
          ? $(this).show() : $(this).hide() ;
      });
      updateTitle();
    }


    /**
     * Search by title/url - case insensitive.
     */
    $("#fill").keyup(function() {
      filter = $("#fill").val().toLowerCase();

      $("#bookmarks").children().each( function(){
        var title=$(this).text().toLowerCase();
        var links=$(this).find("a");
        if ( typeof links !== 'undefined' )
        {
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
    $('#untagged').click(function(event){
      event.preventDefault();
      $("#bookmarks").children().each( function() {
        var tags=$(this).attr('title');
        ( typeof tags !== 'undefined' ) ? $(this).hide() : $(this).show();
      });
      updateTitle();
    });



  });

