from django.contrib import admin

from.models import Listings, Bids, Comments, Watchlist

admin.site.register(Listings)
admin.site.register(Bids)
admin.site.register(Comments)
admin.site.register(Watchlist)
