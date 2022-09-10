from django import forms
from .models import Comments, Listings, Bids

class ListingForm(forms.ModelForm):
    class Meta:
        model = Listings
        fields = ('title', 'imageImg', 'category', 'description')
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control'}),
            'category':forms.Select(attrs={'class': 'form-control'}),
            'imageImg': forms.FileInput(attrs={'class': 'form-control-file'})
        }
        labels = {
            'imageImg': 'Image(optional):',
            'category': 'Category(optional):'
        }

class BidForm(forms.ModelForm):
    class Meta:
        model = Bids
        fields = ('bid',)
        widgets = {
            'bid': forms.NumberInput(attrs={'class': 'form-control bid', 'placeholder': 'Bid' })
        }
        labels = {
            'bid':''
        }

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comments
        fields = ('comment',)
        widgets = {
            'comment': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Comment'})
        }
        labels = {
            'comment':''
        }
