# فصل چهاردهم: مدیریت دیسک و ذخیره‌سازی در لینوکس

## Linux Disk and Storage Management

ذخیره‌سازی یکی از مهم‌ترین بخش‌های هر سیستم‌عامل است.

هر سیستم لینوکسی برای ذخیره اطلاعات، اجرای برنامه‌ها، نگهداری فایل‌های کاربران و مدیریت داده‌ها به فضای ذخیره‌سازی نیاز دارد.

یک کاربر حرفه‌ای لینوکس باید بداند:

- دیسک‌ها چگونه شناسایی می‌شوند.
- Partition چیست.
- File System چگونه کار می‌کند.
- چگونه فضای ذخیره‌سازی را مدیریت کند.
- چگونه مشکلات مربوط به دیسک را بررسی کند.

در این فصل با مفاهیم پایه تا پیشرفته مدیریت Storage در لینوکس آشنا می‌شویم.

---

# Storage چیست؟

Storage یا فضای ذخیره‌سازی محلی برای نگهداری دائمی اطلاعات است.

برخلاف RAM که موقت است، اطلاعات موجود در Storage پس از خاموش شدن سیستم باقی می‌مانند.

نمونه‌های Storage:

- HDD
- SSD
- NVMe
- USB Drive
- Network Storage

---

# ساختار ذخیره‌سازی در لینوکس

در لینوکس معمولاً ساختار ذخیره‌سازی به شکل زیر است:

    Disk

      |

      ▼

    Partition

      |

      ▼

    File System

      |

      ▼

    Directory

---

# Disk چیست؟

Disk یک وسیله فیزیکی ذخیره‌سازی است.

مثال:

    /dev/sda

یک هارد یا SSD ممکن است چند Partition داشته باشد.

---

# Device در لینوکس

لینوکس تمام سخت‌افزارهای ذخیره‌سازی را به شکل فایل نمایش می‌دهد.

مسیر اصلی:

    /dev

مثال:

هارد اول:

    /dev/sda

پارتیشن اول:

    /dev/sda1

پارتیشن دوم:

    /dev/sda2

---

# مشاهده دیسک‌ها

برای مشاهده دیسک‌های متصل:

    lsblk

نمونه خروجی:

    sda
    ├── sda1
    └── sda2

---

# دستور fdisk

برای مدیریت Partitionها استفاده می‌شود.

مشاهده دیسک‌ها:

    sudo fdisk -l

---

# Partition چیست؟

Partition یک بخش منطقی از یک Disk است.

یک Disk می‌تواند به چند بخش تقسیم شود.

مثال:

یک SSD با ظرفیت 500GB:

    /dev/sda1

برای سیستم‌عامل

    /dev/sda2

برای فایل‌های شخصی

---

# Partition Table چیست؟

Partition Table اطلاعات مربوط به ساختار دیسک را نگهداری می‌کند.

دو نوع اصلی:

- MBR
- GPT

---

# MBR چیست؟

MBR مخفف:

    Master Boot Record

است.

ویژگی‌ها:

- قدیمی‌تر است.
- محدودیت تعداد Partition دارد.
- برای دیسک‌های کوچک‌تر مناسب است.

---

# GPT چیست؟

GPT مخفف:

    GUID Partition Table

است.

ویژگی‌ها:

- جدیدتر است.
- از دیسک‌های بزرگ پشتیبانی می‌کند.
- تعداد Partition بیشتری دارد.
- با سیستم‌های UEFI هماهنگ است.

---

# File System چیست؟

File System روشی برای سازمان‌دهی و ذخیره فایل‌ها روی Storage است.

بدون File System سیستم‌عامل نمی‌تواند فایل‌ها را مدیریت کند.

---

# File System های معروف لینوکس

مهم‌ترین File Systemها:

- ext4
- XFS
- Btrfs

---

# ext4

ext4 یکی از رایج‌ترین File Systemهای لینوکس است.

ویژگی‌ها:

- پایدار
- سریع
- مناسب استفاده روزمره
- پشتیبانی گسترده

بسیاری از توزیع‌های لینوکس از ext4 استفاده می‌کنند.

---

# XFS

XFS یک File System قدرتمند برای سرورها است.

ویژگی‌ها:

- عملکرد بالا
- مناسب فایل‌های بزرگ
- استفاده در محیط‌های Enterprise

---

# Btrfs

Btrfs یک File System مدرن است.

قابلیت‌ها:

- Snapshot
- Compression
- مدیریت پیشرفته Storage

---

# Mount چیست؟

در لینوکس برای استفاده از یک Storage باید آن را به یک مسیر متصل کنیم.

این کار:

    Mount

نام دارد.

مثال:

یک Partition:

    /dev/sdb1

به مسیر:

    /mnt/data

متصل می‌شود.

---

# مشاهده Mount ها

دستور:

    mount

یا:

    findmnt

---

# Mount کردن یک Partition

مثال:

ساخت مسیر:

    sudo mkdir /mnt/data

Mount:

    sudo mount /dev/sdb1 /mnt/data

---

# Unmount چیست؟

جدا کردن Storage از سیستم:

    umount

مثال:

    sudo umount /mnt/data

---

# فایل fstab

برای Mount خودکار هنگام روشن شدن سیستم از فایل:

    /etc/fstab

استفاده می‌شود.

---

# بررسی fstab

مشاهده:

    cat /etc/fstab

---

# UUID چیست؟

هر Partition یک شناسه منحصر به فرد دارد:

    UUID

مشاهده:

    blkid

مثال:

    UUID="a123-b456"

---

# استفاده از UUID در fstab

به جای استفاده از نام Device بهتر است از UUID استفاده شود.

مثال:

    UUID=a123-b456 /mnt/data ext4 defaults 0 2

---

# بررسی فضای دیسک

برای مشاهده فضای استفاده شده:

    df -h

خروجی خواناتر:

    -h

یعنی:

Human Readable

---

# بررسی حجم فایل‌ها

دستور:

    du

مثال:

    du -sh folder/

حجم یک پوشه را نمایش می‌دهد.

---

# پیدا کردن فایل‌های بزرگ

با find:

    sudo find / -xdev -type f -size +1G 2>/dev/null

فایل‌های بزرگ‌تر از 1GB را پیدا می‌کند.

---

# فرمت کردن Partition

برای ایجاد File System:

    mkfs

استفاده می‌شود.

مثال ext4:

    sudo mkfs.ext4 /dev/sdb1

توجه:

فرمت کردن باعث حذف اطلاعات می‌شود.

---

# Swap چیست؟

Swap فضای ذخیره‌سازی است که لینوکس در مواقع کمبود RAM از آن استفاده می‌کند.

RAM:

- سریع است.
- محدود است.

Swap:

- کندتر است.
- فضای بیشتری فراهم می‌کند.

---

# مشاهده Swap

دستور:

    swapon --show

یا:

    free -h

---

# ساخت Swap File

ایجاد فایل:

    sudo fallocate -l 2G /swapfile

تنظیم مجوز:

    sudo chmod 600 /swapfile

ساخت Swap:

    sudo mkswap /swapfile

فعال کردن:

    sudo swapon /swapfile

---

# LVM چیست؟

LVM مخفف:

    Logical Volume Manager

است.

LVM یک سیستم مدیریت Storage انعطاف‌پذیر است.

با LVM می‌توان:

- حجم Storage را تغییر داد.
- فضای جدید اضافه کرد.
- مدیریت دیسک را ساده‌تر کرد.

---

# ساختار LVM

ساختار LVM:

    Physical Volume

          |

          ▼

    Volume Group

          |

          ▼

    Logical Volume

---

# Physical Volume

یک Disk یا Partition که برای LVM آماده شده است.

مثال:

    /dev/sdb1

---

# Volume Group

مجموعه‌ای از Physical Volumeها.

مانند یک مخزن بزرگ Storage.

---

# Logical Volume

فضایی که سیستم از آن استفاده می‌کند.

مانند Partition معمولی.

---

# ابزارهای LVM

مشاهده Physical Volume:

    pvs

مشاهده Volume Group:

    vgs

مشاهده Logical Volume:

    lvs

---

# افزایش فضای Logical Volume

یکی از مزیت‌های LVM:

افزایش آسان فضا است.

ابتدا نوع File System، مسیر دقیق LV و فضای آزاد VG را بررسی کنید. برای نمونه، افزایش ext4 به‌اندازهٔ 10GiB همراه با رشد File System:

    sudo lvextend --resizefs -L +10G /dev/vg_name/lv_name

گزینهٔ `--resizefs` ابزار مناسب File System را فراخوانی می‌کند. XFS قابل کوچک‌کردن نیست و کوچک‌کردن LV یا File System بدون ترتیب و نسخهٔ پشتیبان می‌تواند داده را نابود کند.

---

# بررسی سلامت دیسک

برای بررسی اطلاعات دیسک:

    smartctl

نصب:

    sudo apt install smartmontools

بررسی:

    sudo smartctl -a /dev/sda

---

# Disk Monitoring

برای بررسی وضعیت Storage:

ابزارها:

- df
- du
- iostat
- smartctl

---

# iostat

برای بررسی عملکرد دیسک:

    iostat

نصب:

    sudo apt install sysstat

---

# مدیریت فضای آزاد

برای آزاد کردن فضا:

بررسی:

    df -h

پیدا کردن فایل‌های بزرگ:

    du -sh *

پاک کردن Cache:

    sudo apt clean

---

# پروژه عملی فصل

## ساخت یک فضای ذخیره‌سازی جدید

هدف:

اضافه کردن یک Partition و Mount کردن آن.

مراحل:

مشاهده دیسک‌ها:

    lsblk

ساخت Partition:

    sudo fdisk /dev/sdb

ساخت File System:

    sudo mkfs.ext4 /dev/sdb1

ساخت مسیر:

    sudo mkdir -p /mnt/storage

Mount:

    sudo mount /dev/sdb1 /mnt/storage

پس از گرفتن UUID با `blkid`، ورودی مناسب را در `fstab` ثبت کنید و پیش از reboot با `sudo mount -a` آن را آزمایش کنید. انتخاب اشتباه دیسک یا اجرای `mkfs` اطلاعات را از بین می‌برد؛ نام Device را با `lsblk -f` دوباره بررسی کنید.

---

# تمرین‌های فصل چهاردهم

## تمرین اول

مشاهده دیسک‌ها:

    lsblk


## تمرین دوم

بررسی فضای دیسک:

    df -h


## تمرین سوم

بررسی حجم پوشه‌ها:

    du -sh


## تمرین چهارم

مشاهده Partitionها:

    fdisk -l


## تمرین پنجم

ساخت Swap File آزمایشی.

---

# جمع‌بندی فصل چهاردهم

در این فصل یاد گرفتیم:

- Storage چیست.
- Disk و Partition چه تفاوتی دارند.
- File System چگونه کار می‌کند.
- Mount و Unmount چیست.
- چگونه فضای دیسک را بررسی کنیم.
- Swap چگونه کار می‌کند.
- LVM چیست.
- چگونه Storage را مدیریت کنیم.
- چگونه سلامت دیسک را بررسی کنیم.

مدیریت Storage یکی از مهارت‌های اصلی یک مدیر سیستم لینوکس است.

بدون شناخت صحیح دیسک و فایل سیستم، مدیریت سرورهای لینوکسی امکان‌پذیر نخواهد بود.
