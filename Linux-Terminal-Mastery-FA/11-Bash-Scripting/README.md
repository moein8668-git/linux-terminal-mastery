# فصل دهم: پردازش‌ها و سرویس‌ها در لینوکس

## Linux Processes and Services

در لینوکس، هر برنامه‌ای که در حال اجرا باشد یک **Process** محسوب می‌شود.

درک مفهوم Process و Service یکی از مهم‌ترین بخش‌های مدیریت سیستم لینوکس است.

یک کاربر حرفه‌ای لینوکس باید بداند:

- چه برنامه‌هایی در حال اجرا هستند.
- هر برنامه چه منابعی مصرف می‌کند.
- چگونه یک برنامه را متوقف یا اجرا کند.
- چگونه سرویس‌های سیستم را مدیریت کند.

---

# Process چیست؟

Process یک نمونه در حال اجرای یک برنامه است.

به زبان ساده:

وقتی یک برنامه را اجرا می‌کنیم، سیستم‌عامل یک Process برای آن ایجاد می‌کند.

مثال:

وقتی مرورگر باز می‌شود:

- فایل برنامه از حافظه ذخیره‌سازی خوانده می‌شود.
- اطلاعات آن وارد RAM می‌شود.
- Kernel یک Process برای آن ایجاد می‌کند.
- برنامه شروع به کار می‌کند.

---

# Program و Process چه تفاوتی دارند؟

این دو مفهوم معمولاً با هم اشتباه گرفته می‌شوند.

## Program

یک فایل ذخیره شده روی دیسک است.

مثال:

    firefox

تا زمانی که اجرا نشده، فقط یک Program است.

---

## Process

زمانی ایجاد می‌شود که Program اجرا شود.

مثال:

وقتی Firefox باز می‌شود، یک یا چند Process ایجاد می‌کند.

---

# PID چیست؟

هر Process در لینوکس یک شناسه مخصوص دارد.

این شناسه:

Process ID

یا:

PID

نام دارد.

مثال:

    PID: 1542

Kernel با استفاده از PID هر Process را مدیریت می‌کند.

---

# مشاهده Processها

برای مشاهده Processهای در حال اجرا:

    ps

استفاده می‌شود.

نمایش کامل‌تر:

    ps aux

خروجی شامل:

- PID
- کاربر اجراکننده
- مصرف CPU
- مصرف RAM
- نام برنامه

است.

---

# دستور top

برای مشاهده لحظه‌ای Processها:

    top

استفاده می‌شود.

top اطلاعات زنده نمایش می‌دهد.

شامل:

- میزان استفاده CPU
- میزان مصرف RAM
- Processهای فعال
- زمان اجرا

---

# htop چیست؟

htop نسخه پیشرفته‌تر top است.

مزایا:

- رابط کاربری بهتر
- جستجو بین Processها
- کنترل ساده‌تر
- نمایش گرافیکی منابع

نصب:

    sudo apt install htop

اجرا:

    htop

---

# مدیریت Processها

گاهی یک برنامه هنگ می‌کند یا نیاز داریم آن را متوقف کنیم.

برای این کار از Signal استفاده می‌کنیم.

Signal پیامی است که به Kernel ارسال می‌شود تا یک Process رفتار خاصی انجام دهد.

---

# دستور kill

برای ارسال Signal به یک Process:

    kill PID

مثال:

    kill 1542

این دستور درخواست توقف Process را ارسال می‌کند.

---

# متوقف کردن اجباری Process

اگر Process پاسخ ندهد:

    kill -9 PID

استفاده می‌شود.

Signal شماره 9:

SIGKILL

نام دارد و Process را فوراً متوقف می‌کند.

---

# پیدا کردن PID یک برنامه

برای پیدا کردن Process یک برنامه:

    pidof program-name

مثال:

    pidof firefox

---

# دستور pgrep

روش دیگر:

    pgrep program-name

مثال:

    pgrep ssh

---

# Background و Foreground

در لینوکس برنامه‌ها می‌توانند در دو حالت اجرا شوند.

## Foreground

برنامه کنترل ترمینال را در اختیار دارد.

مثال:

    nano file.txt

---

## Background

برنامه در پشت صحنه اجرا می‌شود.

مثال:

    firefox &

علامت:

    &

باعث اجرای برنامه در پس‌زمینه می‌شود.

---

# مشاهده Jobها

برای مشاهده برنامه‌های پس‌زمینه:

    jobs

استفاده می‌شود.

---

# انتقال Process به Background

با استفاده از:

    Ctrl + Z

برنامه متوقف موقت می‌شود.

سپس:

    bg

آن را به Background منتقل می‌کند.

---

# بازگرداندن Process به Foreground

دستور:

    fg

Process را دوباره به ترمینال بازمی‌گرداند.

---

# Service چیست؟

Service یک برنامه پس‌زمینه است که معمولاً برای ارائه یک قابلیت خاص اجرا می‌شود.

نمونه‌ها:

- Web Server
- Database Server
- SSH Server
- Network Manager

---

# تفاوت Process و Service

Process:

یک برنامه در حال اجرا است.

Service:

یک Process مدیریت‌شده است که معمولاً همیشه در پس‌زمینه فعال است.

هر Service یک Process دارد، اما هر Process الزاماً Service نیست.

---

# Systemd چیست؟

در بسیاری از توزیع‌های مدرن لینوکس، مدیریت Serviceها توسط:

systemd

انجام می‌شود.

systemd اولین Process سیستم است.

PID آن معمولاً:

    1

است.

---

# مشاهده وضعیت Service

برای مشاهده وضعیت یک Service:

    systemctl status service-name

مثال:

    systemctl status ssh

---

# شروع یک Service

برای اجرای یک Service:

    sudo systemctl start service-name

مثال:

    sudo systemctl start ssh

---

# توقف یک Service

برای متوقف کردن:

    sudo systemctl stop service-name

---

# راه‌اندازی مجدد Service

برای Restart:

    sudo systemctl restart service-name

مثال:

    sudo systemctl restart nginx

---

# فعال کردن اجرای خودکار Service

برای اجرای Service هنگام روشن شدن سیستم:

    sudo systemctl enable service-name

---

# غیرفعال کردن اجرای خودکار

    sudo systemctl disable service-name

---

# مشاهده Serviceهای فعال

برای مشاهده تمام Serviceها:

    systemctl list-units --type=service

---

# Log چیست؟

سیستم‌عامل لینوکس اتفاقات مختلف را ثبت می‌کند.

این اطلاعات:

Log

نام دارند.

Logها برای:

- پیدا کردن خطاها
- بررسی مشکلات
- تحلیل امنیتی

استفاده می‌شوند.

---

# Journalctl چیست؟

systemd ابزار مخصوصی برای مشاهده Logها دارد:

    journalctl

مثال:

مشاهده Logهای سیستم:

    journalctl

مشاهده Log یک Service:

    journalctl -u ssh

---

# مدیریت منابع سیستم

برای مدیریت بهتر Processها باید منابع را بررسی کنیم.

مهم‌ترین منابع:

- CPU
- RAM
- Disk
- Network

---

# بررسی مصرف RAM

دستور:

    free

مثال:

    free -h

گزینه:

    -h

اطلاعات را خواناتر نمایش می‌دهد.

---

# بررسی فضای دیسک

برای مشاهده فضای ذخیره‌سازی:

    df -h

استفاده می‌شود.

---

# بررسی مصرف یک پوشه

برای مشاهده حجم پوشه‌ها:

    du -h

مثال:

    du -sh Documents

---

# اولویت Processها

در لینوکس هر Process یک اولویت دارد.

این اولویت:

Nice Value

نام دارد.

محدوده:

    -20 تا 19

است.

عدد کمتر:

اولویت بیشتر.

---

# دستور nice

برای اجرای برنامه با اولویت مشخص:

    nice -n value command

مثال:

    nice -n 10 firefox

---

# دستور renice

برای تغییر اولویت Process در حال اجرا:

    renice value PID

مثال:

    renice 5 1542

---

# تمرین‌های فصل دهم

## تمرین اول

مشاهده Processها:

    ps aux

---

## تمرین دوم

مشاهده منابع سیستم:

    top

---

## تمرین سوم

نصب و اجرای htop:

    sudo apt install htop

    htop

---

## تمرین چهارم

بررسی وضعیت SSH:

    systemctl status ssh

---

## تمرین پنجم

مشاهده Logهای SSH:

    journalctl -u ssh

---

# جمع‌بندی فصل دهم

در این فصل یاد گرفتیم:

- Process چیست.
- تفاوت Program و Process چیست.
- PID چگونه کار می‌کند.
- چگونه Processها را مشاهده و مدیریت کنیم.
- Background و Foreground چیست.
- Service چیست.
- systemd چگونه Serviceها را مدیریت می‌کند.
- چگونه Logهای سیستم را بررسی کنیم.
- چگونه منابع سیستم را کنترل کنیم.

شناخت Processها و Serviceها یکی از مهم‌ترین مهارت‌های مدیریت لینوکس است و پایه‌ای برای یادگیری مدیریت سرور، امنیت و DevOps محسوب می‌شود.
