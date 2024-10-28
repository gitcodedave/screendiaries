# Generated by Django 5.1.2 on 2024-10-25 08:57

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityFeedItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(max_length=20)),
                ('timestamp', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Content',
            fields=[
                ('content_type', models.CharField(choices=[('Movie', 'Movie'), ('Series', 'Series'), ('Episode', 'Episode')], max_length=7)),
                ('season', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('episode', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('title', models.CharField(max_length=200)),
                ('year', models.CharField(max_length=20)),
                ('director', models.CharField(max_length=70)),
                ('actors', models.TextField()),
                ('genre', models.CharField(max_length=40)),
                ('plot', models.TextField()),
                ('poster', models.URLField()),
                ('runtime', models.CharField(max_length=50)),
                ('imdbid', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('seriesid', models.CharField(max_length=50, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment_text', models.TextField()),
                ('likes', models.PositiveIntegerField(default=0)),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('activity_feed', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='network.activityfeeditem')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='network.comment')),
            ],
        ),
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField(validators=[django.core.validators.MaxValueValidator(5), django.core.validators.MinValueValidator(1)])),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('activity_feed', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='network.activityfeeditem')),
                ('content', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.content')),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bio', models.TextField(blank=True, default='I just joined screendiaries!')),
                ('profile_picture', models.ImageField(default='network/images/default_profile_img.png', max_length=500, upload_to='network/images')),
                ('profile_cover', models.ImageField(blank=True, max_length=500, upload_to='network/images')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Update',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('update_type', models.CharField(choices=[('Follow', 'Follow'), ('Reply', 'Reply'), ('Reaction', 'Reaction')], max_length=8)),
                ('read_status', models.BooleanField(default=False)),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('activity_feed_item', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='network.activityfeeditem')),
                ('follower', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='originaluser', to='network.userprofile')),
                ('user_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='updates', to='network.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='TopTen',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ranking', models.PositiveSmallIntegerField(validators=[django.core.validators.MaxValueValidator(10), django.core.validators.MinValueValidator(1)])),
                ('content', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.content')),
                ('user_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('review_text', models.TextField()),
                ('rating', models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MaxValueValidator(5), django.core.validators.MinValueValidator(1)])),
                ('contains_spoiler', models.BooleanField()),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('activity_feed', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='network.activityfeeditem')),
                ('content', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.content')),
                ('user_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Reaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reaction', models.CharField(choices=[('Love', 'Love'), ('Thumbs Up', 'Thumbs Up'), ('Thumbs Down', 'Thumbs Down'), ('Laughing', 'Laughing'), ('Crying', 'Crying'), ('Surprised', 'Surprised'), ('Sick', 'Sick'), ('Angry', 'Angry')], max_length=11)),
                ('activity_feed', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='network.activityfeeditem')),
                ('comment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='network.comment')),
                ('rating', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='network.rating')),
                ('review', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='network.review')),
                ('user_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile')),
            ],
        ),
        migrations.AddField(
            model_name='rating',
            name='user_profile',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile'),
        ),
        migrations.CreateModel(
            name='QueueItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('content', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.content')),
                ('user_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message_type', models.CharField(choices=[('Content Share', 'Content Share'), ('Activity Feed Share', 'Activity Feed Share'), ('Text', 'Text')], max_length=19)),
                ('content_id', models.PositiveIntegerField(blank=True, null=True)),
                ('activity_feed_id', models.PositiveIntegerField(blank=True, null=True)),
                ('message_text', models.TextField()),
                ('reaction_emoji', models.CharField(default='', max_length=10)),
                ('status_unread', models.BooleanField(default=True)),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_messages', to='network.userprofile')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to='network.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Follow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('follower', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='following', to='network.userprofile')),
                ('following', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='followers', to='network.userprofile')),
            ],
        ),
        migrations.AddField(
            model_name='comment',
            name='user_profile',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile'),
        ),
        migrations.AddField(
            model_name='activityfeeditem',
            name='user_profile',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile'),
        ),
        migrations.CreateModel(
            name='WatchListItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('Currently Watching', 'Currently Watching'), ('Watched', 'Watched')], max_length=18)),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('content', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.content')),
                ('user_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.userprofile')),
            ],
        ),
        migrations.AddConstraint(
            model_name='review',
            constraint=models.UniqueConstraint(fields=('content', 'user_profile'), name='unique_review'),
        ),
        migrations.AddConstraint(
            model_name='rating',
            constraint=models.UniqueConstraint(fields=('content', 'user_profile'), name='unique_rating'),
        ),
        migrations.AddConstraint(
            model_name='follow',
            constraint=models.UniqueConstraint(fields=('follower', 'following'), name='unique_follower'),
        ),
        migrations.AddConstraint(
            model_name='watchlistitem',
            constraint=models.UniqueConstraint(fields=('content', 'user_profile'), name='unique_watchlist_item'),
        ),
    ]
