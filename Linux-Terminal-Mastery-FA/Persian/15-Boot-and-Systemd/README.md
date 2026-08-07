# فصل پانزدهم: فرآیند Boot و مدیریت Systemd

## Linux Boot Process and Systemd

وقتی یک سیستم لینوکسی را روشن می‌کنیم، سیستم‌عامل بلافاصله اجرا نمی‌شود.

قبل از اینکه کاربر بتواند وارد محیط لینوکس شود، چندین مرحله مهم اتفاق می‌افتد:

- بررسی سخت‌افزار
- اجرای Firmware
- بارگذاری Bootloader
- اجرای Kernel
- راه‌اندازی سرویس‌ها
- آماده‌سازی محیط کاربر

شناخت فرآیند Boot برای یک مدیر سیستم لینوکس بسیار مهم است؛ زیرا بسیاری از مشکلات سیستم در همین مراحل اتفاق می‌افتند.

---

# فرآیند Boot چیست؟

Boot Process مجموعه مراحلی است که سیستم از لحظه روشن شدن تا آماده شدن محیط کاربر طی می‌کند.

ساختار کلی:

    Power On

        |

        ▼

    BIOS / UEFI

        |

        ▼

    Bootloader (GRUB)

        |

        ▼

    Linux Kernel

        |

        ▼

    Systemd

        |

        ▼

    Services

        |

        ▼

    User Environment

---

# مرحله اول: Power On

با فشردن دکمه Power:

- CPU شروع به کار می‌کند.
- Firmware اجرا می‌شود.
- سخت‌افزار بررسی می‌شود.

این مرحله توسط BIOS یا UEFI مدیریت می‌شود.

---

# BIOS چیست؟

BIOS مخفف:

    Basic Input/Output System

است.

BIOS یک Firmware قدیمی است که وظیفه دارد:

- سخت‌افزار را شناسایی کند.
- دستگاه Boot را پیدا کند.
- Bootloader را اجرا کند.

---

# UEFI چیست؟

UEFI نسخه جدیدتر BIOS است.

مزایا:

- سرعت بیشتر
- پشتیبانی از دیسک‌های بزرگ‌تر
- امنیت بهتر
- پشتیبانی از Secure Boot

امروزه اکثر سیستم‌های جدید از UEFI استفاده می‌کنند.

---

# Bootloader چیست؟

Bootloader برنامه‌ای است که مسئول بارگذاری سیستم‌عامل است.

وظیفه:

- پیدا کردن Kernel
- انتقال کنترل سیستم به Kernel

در لینوکس رایج‌ترین Bootloader:

    GRUB

است.

---

# GRUB چیست؟

GRUB مخفف:

    Grand Unified Bootloader

است.

GRUB به کاربر اجازه می‌دهد:

- سیستم‌عامل را انتخاب کند.
- Kernelهای مختلف را اجرا کند.
- وارد Recovery Mode شود.

---

# فایل‌های GRUB

مسیرهای مهم:

    /boot/grub

تنظیمات:

    /etc/default/grub

---

# بروزرسانی GRUB

بعد از تغییر تنظیمات:

    sudo update-grub

اجرا می‌شود.

---

# Kernel چیست؟

Kernel هسته اصلی سیستم‌عامل لینوکس است.

Kernel مسئول مدیریت:

- CPU
- Memory
- Hardware
- Processes
- Devices

است.

---

# مشاهده Kernel فعلی

دستور:

    uname -r

مثال:

    6.17.0-35-generic

---

# Kernel در Boot

بعد از اجرای GRUB:

Kernel از دیسک خوانده شده و در حافظه RAM قرار می‌گیرد.

سپس کنترل سیستم را در دست می‌گیرد.

---

# Init چیست؟

پس از اجرای Kernel، اولین Process سیستم اجرا می‌شود.

این Process:

    PID 1

نام دارد.

در گذشته این وظیفه بر عهده:

    init

بود.

---

# Systemd چیست؟

در اکثر توزیع‌های مدرن لینوکس، Init با:

    systemd

جایگزین شده است.

Systemd مهم‌ترین سیستم مدیریت سرویس‌ها در لینوکس است.

---

# وظایف Systemd

Systemd مسئول:

- اجرای سرویس‌ها
- مدیریت Startup
- کنترل Processها
- ثبت Logها
- مدیریت Dependencyها

است.

---

# مشاهده PID یک Systemd

دستور:

    ps -p 1

نمونه خروجی:

    systemd

---

# Unit در Systemd چیست؟

Systemd همه چیز را به شکل:

    Unit

مدیریت می‌کند.

انواع Unit:

- Service
- Socket
- Target
- Timer
- Mount

---

# Service چیست؟

Service یک برنامه یا Daemon در حال اجرا است.

مثال:

    ssh.service

    nginx.service

---

# مشاهده سرویس‌ها

مشاهده همه سرویس‌ها:

    systemctl list-units --type=service

---

# بررسی وضعیت یک سرویس

مثال:

    systemctl status ssh

---

# شروع یک سرویس

ساختار:

    sudo systemctl start service-name

مثال:

    sudo systemctl start ssh

---

# توقف سرویس

    sudo systemctl stop service-name

مثال:

    sudo systemctl stop ssh

---

# ری‌استارت سرویس

    sudo systemctl restart service-name

---

# فعال کردن سرویس هنگام Boot

برای اجرای خودکار:

    sudo systemctl enable service-name

مثال:

    sudo systemctl enable ssh

---

# غیرفعال کردن Startup

    sudo systemctl disable service-name

---

# بررسی فعال بودن سرویس

    systemctl is-enabled ssh

---

# Target چیست؟

Target در Systemd شبیه Runlevelهای قدیمی است.

Target مشخص می‌کند سیستم در چه حالت کاری قرار دارد.

---

# Target های مهم

حالت گرافیکی:

    graphical.target

حالت چندکاربره:

    multi-user.target

حالت خاموش:

    poweroff.target

حالت Restart:

    reboot.target

---

# مشاهده Target فعلی

دستور:

    systemctl get-default

---

# تغییر Target پیش‌فرض

مثال:

    sudo systemctl set-default multi-user.target

---

# Journal چیست؟

Systemd سیستم ثبت Log داخلی دارد:

    journal

ابزار مشاهده:

    journalctl

---

# مشاهده تمام Logها

    journalctl

---

# Logهای Kernel

    journalctl -k

---

# Log یک سرویس

مثال:

    journalctl -u ssh

---

# مشاهده Logهای جدید

    journalctl -f

مانند:

    tail -f

کار می‌کند.

---

# بررسی مشکلات Boot

اگر سیستم مشکل دارد:

بررسی Logهای Boot:

    journalctl -b

---

# مشاهده خطاهای Boot

    journalctl -b -p err

فقط خطاها را نمایش می‌دهد.

---

# Recovery Mode چیست؟

Recovery Mode یک حالت تعمیر سیستم است.

کاربردها:

- تعمیر فایل‌ها
- تغییر رمز عبور
- رفع مشکل Boot
- تعمیر Packageها

---

# Single User Mode

یک حالت حداقلی برای تعمیر سیستم است.

در این حالت:

- سرویس‌های کمتری اجرا می‌شوند.
- دسترسی مدیریتی فراهم است.

---

# مدیریت Startup برنامه‌ها

برنامه‌هایی که هنگام Boot اجرا می‌شوند توسط Systemd مدیریت می‌شوند.

مشاهده:

    systemctl list-unit-files

---

# ساخت Service شخصی

فرض کنید Script داریم:

    /home/user/script.sh

یک Service بسازیم:

    /etc/systemd/system/myscript.service

---

# ساختار Service

نمونه:

    [Unit]

    Description=My Script Service


    [Service]

    ExecStart=/home/user/script.sh


    [Install]

    WantedBy=multi-user.target

---

# Reload کردن Systemd

بعد از ساخت Service:

    sudo systemctl daemon-reload

---

# اجرای Service جدید

    sudo systemctl start myscript

فعال کردن:

    sudo systemctl enable myscript

---

# Systemd Timer

Systemd قابلیت زمان‌بندی نیز دارد.

مانند:

    Cron

اما با امکانات بیشتر.

مشاهده Timerها:

    systemctl list-timers

---

# تفاوت Cron و Systemd Timer

Cron:

- ساده‌تر
- قدیمی‌تر
- مناسب کارهای روزمره

Systemd Timer:

- مدرن‌تر
- مدیریت بهتر
- هماهنگ با Systemd

---

# مشکلات رایج Boot

## سیستم بالا نمی‌آید

دلایل:

- مشکل GRUB
- خرابی Kernel
- مشکل Disk
- مشکل File System

---

# بررسی فضای Boot

مشاهده:

    ls /boot

---

# بررسی Kernelهای نصب شده

Ubuntu:

    dpkg --list | grep linux-image

---

# تعمیر GRUB

در صورت مشکل:

    sudo grub-install

سپس:

    sudo update-grub

---

# پروژه عملی فصل

## ساخت یک Service شخصی

هدف:

ساخت سرویسی که هنگام Boot اجرا شود.

مراحل:

ساخت Script:

    nano startup.sh


اجازه اجرا:

    chmod +x startup.sh


ساخت فایل Service:

    /etc/systemd/system/startup.service


Reload:

    sudo systemctl daemon-reload


فعال کردن:

    sudo systemctl enable startup

---

# تمرین‌های فصل پانزدهم

## تمرین اول

مشاهده Kernel:

    uname -r


## تمرین دوم

بررسی Systemd:

    systemctl status


## تمرین سوم

مشاهده سرویس‌ها:

    systemctl list-units --type=service


## تمرین چهارم

بررسی Logهای Boot:

    journalctl -b


## تمرین پنجم

ساخت یک Service ساده.

---

# جمع‌بندی فصل پانزدهم

در این فصل یاد گرفتیم:

- سیستم لینوکس چگونه Boot می‌شود.
- BIOS و UEFI چیست.
- GRUB چگونه کار می‌کند.
- Kernel چه وظیفه‌ای دارد.
- Systemd چیست.
- چگونه سرویس‌ها را مدیریت کنیم.
- چگونه Logها را بررسی کنیم.
- چگونه Service شخصی بسازیم.
- چگونه مشکلات Boot را عیب‌یابی کنیم.

شناخت Boot Process و Systemd یکی از مهم‌ترین مهارت‌های یک مدیر سیستم لینوکس است.

بدون شناخت این بخش‌ها، مدیریت حرفه‌ای سرورها و سیستم‌های لینوکسی امکان‌پذیر نیست.
