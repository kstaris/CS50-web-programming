from django.urls import path

from django.conf.urls.static import static
from django.conf import settings

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("categories", views.categories, name="categories"),
    path("categories/<str:category>", views.categories, name="subCategories"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("create", views.create, name="create"),
    path("listing/<str:listing_id>/<str:title>", views.listing, name="listing"),
    path("watchlistadd/<str:listing_id>",views.watchlist, name="watchlistAdd"),
    path("bid/<str:listing_id>", views.bid, name="bid"),
    path("close/<str:listing_id>", views.close, name="close"),
    path("comment/<str:listing_id>",views.comment, name="comment")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)