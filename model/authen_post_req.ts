export interface AuthenPostReq {
    uid:       number;
    type:      number;
    name:      string;
    email:     string;
    password:  string;
    image:     string;
    img_limit: number;
}