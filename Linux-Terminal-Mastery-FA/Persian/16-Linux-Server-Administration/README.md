# فصل شانزدهم: مدیریت سرور لینوکس

## Linux Server Administration

تا این مرحله با بخش‌های مهم لینوکس مانند ترمینال، فایل سیستم، شبکه، Bash، امنیت و مدیریت سرویس‌ها آشنا شدیم.

اکنون زمان آن رسیده است که وارد یکی از مهم‌ترین کاربردهای واقعی لینوکس شویم:

**مدیریت سرور**

بخش بزرگی از اینترنت روی سرورهای لینوکسی اجرا می‌شود.

از:

- وب‌سایت‌ها
- APIها
- دیتابیس‌ها
- سرویس‌های ابری
- سیستم‌های سازمانی

گرفته تا زیرساخت‌های بزرگ، همگی از لینوکس استفاده می‌کنند.

---

# Server چیست؟

Server یک سیستم کامپیوتری است که وظیفه ارائه سرویس به سیستم‌های دیگر را دارد.

برخلاف کامپیوتر شخصی، Server معمولاً برای:

- کار مداوم
- پایداری بالا
- مدیریت از راه دور
- ارائه خدمات شبکه

طراحی شده است.

---

# تفاوت Desktop و Server

## Desktop

برای کاربران عادی:

- اجرای برنامه‌ها
- مرور وب
- کارهای روزمره

استفاده می‌شود.

---

## Server

برای ارائه خدمات:

- Web Server
- Database
- File Server
- DNS Server
- Cloud Service

استفاده می‌شود.

---

# ویژگی‌های یک Server خوب

یک سرور باید:

- پایدار باشد.
- امن باشد.
- قابل مدیریت باشد.
- همیشه در دسترس باشد.
- Log و Monitoring داشته باشد.

---

# توزیع‌های رایج Server لینوکس

توزیع‌های محبوب:

- Ubuntu Server
- Debian
- Rocky Linux
- AlmaLinux
- Red Hat Enterprise Linux

---

# اتصال به سرور با SSH

در اکثر مواقع مدیر سیستم مستقیماً به سرور دسترسی فیزیکی ندارد.

به همین دلیل از SSH استفاده می‌شود.

ساختار:

    ssh username@server_ip

مثال:

    ssh admin@192.168.1.10

---

# آماده‌سازی اولیه سرور

پس از نصب لینوکس روی Server معمولاً این مراحل انجام می‌شود:

- بروزرسانی سیستم
- ساخت کاربر جدید
- تنظیم SSH
- فعال کردن Firewall
- نصب ابزارهای مدیریتی

---

# بروزرسانی سیستم

Ubuntu/Debian:

    sudo apt update

    sudo apt upgrade

---

# تنظیم Hostname

Hostname نام سیستم در شبکه است.

مشاهده:

    hostname

تغییر:

    sudo hostnamectl set-hostname server-name

---

# مدیریت کاربران سرور

در سرورها بهتر است هر شخص حساب کاربری جدا داشته باشد.

ایجاد کاربر:

    sudo adduser username

دادن دسترسی sudo:

    sudo usermod -aG sudo username

---

# ساختار استاندارد یک سرور

یک سرور معمولاً شامل:

    /etc

تنظیمات سیستم


    /var

داده سرویس‌ها و Logها


    /home

فایل کاربران


    /opt

نرم‌افزارهای اضافی


    /srv

داده سرویس‌ها

---

# Web Server چیست؟

Web Server نرم‌افزاری است که صفحات وب را به کاربران ارائه می‌دهد.

وظیفه:

دریافت درخواست HTTP و ارسال پاسخ.

---

# HTTP چیست؟

HTTP پروتکلی برای انتقال اطلاعات وب است.

مثال:

کاربر:

    Browser

درخواست می‌فرستد:

    HTTP Request

سرور پاسخ می‌دهد:

    HTTP Response

---

# HTTPS چیست؟

HTTPS نسخه امن HTTP است.

اطلاعات با:

    SSL/TLS

رمزنگاری می‌شوند.

---

# Nginx چیست؟

Nginx یکی از محبوب‌ترین Web Serverهای لینوکس است.

کاربردها:

- Hosting Website
- Reverse Proxy
- Load Balancer
- API Gateway

---

# نصب Nginx

Ubuntu:

    sudo apt install nginx

---

# مدیریت Nginx

شروع:

    sudo systemctl start nginx

فعال هنگام Boot:

    sudo systemctl enable nginx

بررسی:

    systemctl status nginx

---

# تست Nginx

پس از نصب:

مرورگر را باز کنید:

    http://server-ip

اگر صفحه پیش‌فرض نمایش داده شد، Nginx فعال است.

---

# فایل‌های مهم Nginx

مسیر اصلی:

    /etc/nginx


تنظیمات:

    /etc/nginx/nginx.conf


سایت‌ها:

    /etc/nginx/sites-available

    /etc/nginx/sites-enabled

---

# Virtual Host چیست؟

Virtual Host اجازه می‌دهد چندین سایت روی یک سرور اجرا شوند.

مثال:

سرور:

    192.168.1.10

سایت اول:

    site1.com

سایت دوم:

    site2.com

---

# Apache چیست؟

Apache یکی دیگر از Web Serverهای معروف است.

ویژگی‌ها:

- قدیمی و پایدار
- انعطاف‌پذیر
- محبوب در Hosting

---

# نصب Apache

    sudo apt install apache2

---

# Database Server چیست؟

Database Server وظیفه ذخیره و مدیریت اطلاعات را دارد.

نمونه‌ها:

- MySQL
- MariaDB
- PostgreSQL

---

# MySQL چیست؟

MySQL یک سیستم مدیریت دیتابیس رابطه‌ای است.

کاربرد:

- وب‌سایت‌ها
- برنامه‌ها
- سیستم‌های مدیریت محتوا

---

# PostgreSQL چیست؟

PostgreSQL یک دیتابیس قدرتمند و پیشرفته است.

ویژگی‌ها:

- استاندارد بالا
- مناسب پروژه‌های بزرگ
- امکانات حرفه‌ای

---

# انتقال فایل به Server

برای انتقال فایل‌ها:

- SCP
- SFTP
- rsync

استفاده می‌شود.

---

# SCP

کپی امن فایل از طریق SSH.

ارسال فایل:

    scp file.txt user@server:/home/user

---

# SFTP

انتقال فایل تعاملی با SSH.

اتصال:

    sftp user@server

---

# rsync

ابزار قدرتمند همگام‌سازی فایل‌ها.

مثال:

    rsync -av folder/ user@server:/backup/

---

# مدیریت Log ها

Logها برای بررسی مشکلات بسیار مهم هستند.

مسیر مهم:

    /var/log

---

# مشاهده Log سیستم

    journalctl

---

# Log سرویس‌ها

مثال:

    journalctl -u nginx

---

# بررسی منابع Server

یک مدیر سرور باید همیشه منابع را بررسی کند.

منابع مهم:

- CPU
- RAM
- Disk
- Network

---

# بررسی CPU و RAM

دستور:

    top

یا:

    htop

---

# بررسی فضای دیسک

    df -h

---

# بررسی Network

دستور:

    ip addr

و:

    ss -tuln

---

# Monitoring چیست؟

Monitoring یعنی بررسی دائمی وضعیت سیستم.

موارد بررسی:

- مصرف CPU
- حافظه
- خطاها
- سرویس‌ها
- فضای ذخیره‌سازی

---

# ابزارهای Monitoring

نمونه ابزارها:

- htop
- Netdata
- Prometheus
- Grafana

---

# Backup در Server

Backup یکی از مهم‌ترین وظایف مدیریت سرور است.

انواع Backup:

- Full Backup
- Incremental Backup
- Database Backup

---

# Backup ساده با tar

ساخت آرشیو:

    tar -czf backup.tar.gz folder/

---

# امنیت اولیه Server

مراحل مهم:

- استفاده از SSH Key
- غیرفعال کردن Root Login
- فعال کردن Firewall
- بروزرسانی منظم
- حذف سرویس‌های غیرضروری

---

# Firewall در Server

بررسی:

    sudo ufw status

فعال کردن:

    sudo ufw enable

باز کردن SSH:

    sudo ufw allow ssh

---

# پروژه عملی فصل

## راه‌اندازی Web Server امن

هدف:

ساخت یک سرور وب ساده.

مراحل:

بروزرسانی:

    sudo apt update


نصب Nginx:

    sudo apt install nginx


فعال کردن:

    sudo systemctl enable nginx


تنظیم Firewall:

    sudo ufw allow 80


بررسی:

    systemctl status nginx

---

# تمرین‌های فصل شانزدهم

## تمرین اول

اتصال به یک سیستم با SSH.


## تمرین دوم

نصب Nginx.


## تمرین سوم

بررسی سرویس‌ها:

    systemctl


## تمرین چهارم

انتقال فایل با SCP.


## تمرین پنجم

ساخت Backup.

---

# جمع‌بندی فصل شانزدهم

در این فصل یاد گرفتیم:

- Server چیست.
- تفاوت Desktop و Server چیست.
- چگونه به Server متصل شویم.
- چگونه کاربران را مدیریت کنیم.
- Web Server چیست.
- Nginx و Apache چگونه کار می‌کنند.
- Database Server چیست.
- چگونه فایل منتقل کنیم.
- چگونه منابع Server را بررسی کنیم.
- چگونه یک Server را امن‌تر کنیم.

مدیریت سرور لینوکس یکی از مهم‌ترین مهارت‌ها برای ورود به حوزه‌های:

- System Administration
- DevOps
- Cloud Computing
- Cyber Security

است.
