# Generated by Django 4.1 on 2022-09-02 10:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0005_remove_listings_startbid_alter_listings_category_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listings',
            name='image',
            field=models.ImageField(blank=True, upload_to='images'),
        ),
    ]