#!/usr/bin/env python2
# coding: utf-8

__version__ = "0.0.1"
import io
import re
from pyzotero import zotero, zotero_errors
with open('.apikey') as f:
    apikey = f.readline().strip()

zot = zotero.Zotero(2370588, 'group', apikey)

def append_bookmarks(items, color=u"hsl(110,50%,90%)"):
    if items:
        bookmarks = u''
        for item in items:
            tags = zot.item_tags(item['key'])
            data = item['data']
            if data['itemType'] == 'note':
                return

            bookmarks += u"\n<li class=\"bookmark\" style=\"background-color: %s;\" title=\"%s\">\n" % (color, ", ".join(tags))
            bookmarks += u"  <a target=\"_blank\" href=\"%s\">\n    %s\n</a>" % (data['url'], data['title'])
            type = re.sub("([a-z])([A-Z])","\g<1> \g<2>", data['itemType']).lower()
            bookmarks += u"  <span class=\"type\">%s</span>\n" % type

            if data['rights']:
                bookmarks += u"  <span class=\"rights\">(%s)</span>\n" % data['rights']

            if data['creators']:
                bookmarks += u"  <ul>"
                for c in data['creators']:
                    bookmarks += u"    <li class=\"creators\" title\"%s\">%s, %s</li>" % (c['creatorType'], c['lastName'], c['firstName'])

                bookmarks += u"  </ul>"

            if data['shortTitle']:
                bookmarks += u"  <p class=\"stitle\">%s</p>\n" % data['shortTitle']

            if data['abstractNote']:
                bookmarks += u"  <p class=\"abstract\">%s</p>\n" % data['abstractNote']

            bookmarks += u"</li>\n"
    return bookmarks

def generate_html():
    html = u''

    html += u"""
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"
    "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Language" content="en-gb" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link href="main.css" rel="stylesheet">
    <script type="text/javascript" src="jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="bookmarks.js"></script>
    <title>CoderDojo bookmarks</title>
    </head><body>
    <div id="wrap">
      <header><h1 id=\"title\">CoderDojo Belgium bookmarks</h1>
    """

    html += u"<span>(%s)</span>\n" % zot.num_items()
    # TODO: .groups() returns empty, why?
    #       add description to aside
    #desc = zot.groups()[0]['data']['description']

    html += u"""
      <span id=\"num_items\">&nbsp</span>
      </header>
      <form id="filter" name="filter" action="#">
        <input type="text"
                name="fill"
                id="fill"
                value=""
                placeholder="filter" />
      </form>
      <aside id="tags">
        <a href="#untagged" id="untagged">untagged</a>
        <p id="autotags"></p>
        <div id="help">
        <p>To add links, create a zotero account and install zotero (plus browser connector).
        Then join the <a target="_blank" href="https://www.zotero.org/groups/2370588/coderdojobelgium">Coderdojobelgium</a> group.</p>
        <p>This static page is generated from that group library using <a target="_blank" href="https://pyzotero.readthedocs.io">pyzotero</a>.
        The (rather basic) generator script and included files can be found in <a target="_blank" href="https://github.com/sharethewisdom/cdj-bookmarks">this repo</a>.</p>
        <p>You'll need to contact someone with the API key and put it in <span style="font: monospace;">.keyfile</span> in the root directory.</p>
        </div>
      </aside>
      <main>
        <ul id="bookmarks">
    """

    items = zot.top(limit=2)
    collections = zot.collections_top()
    hue = 0

    if collections:
        for col in collections:
            print('adding ' + col['data']['name'])
            items = zot.collection_items(col['data']['key'])
            color = u"hsl(%s,40%%,90%%)" % hue
            hue = max(hue+40, 255)
            html += append_bookmarks(items,color)

    else:
        items = zot.everything(zot.top())
        html += append_bookmarks(items)

    html += u"""
      </ul>
    </main>
    </div>
    </body>
    </html>
    """
    return html

output = generate_html()
file='index.html'
with io.open(file, 'w', encoding='utf8') as f:
    f.write(output)
