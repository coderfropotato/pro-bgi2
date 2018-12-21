import { Component, OnInit } from "@angular/core";
import { AjaxService } from "src/app/super/service/ajaxService";
import { GlobalService } from "src/app/super/service/globalService";

declare const d3: any;

@Component({
    selector: 'app-net',
    templateUrl: './net.component.html'
})

export class netComponent implements OnInit {
    force: number;  //斥力
    isMultiSelect: boolean = false;
    selectedNodes: object[] = [];
    chartData: any;

    constructor(
        private ajaxService: AjaxService,
        private globalService:GlobalService
    ) { }

    ngOnInit() {
        this.force = 60;
        this.getData();
    }

    getData() {
        // this.ajaxService
        //     .getDeferData(
        //         {
        //             url: "http://localhost:8086/net",
        //             data: {}
        //         }
        //     )
        //     .subscribe(
        //         (data: any) => {
        //             this.chartData = data;
        //             this.drawChart(data);
        //         },
        //         error => {
        //             console.log(error);
        //         }
        //     )
        let data={
            "nodes": [{
                "gene_symbol": "RTN3",
                "ppi_protein_cluster1": "9606.ENSP00000344106",
                "id": "10313"
            }, {
                "gene_symbol": "ADCY5",
                "ppi_protein_cluster1": "9606.ENSP00000419361",
                "id": "111"
            }, {
    
                "gene_symbol": "PNMA5",
                "ppi_protein_cluster1": "9606.ENSP00000395538",
                "id": "114824"
            }, {
    
                "gene_symbol": "GRIN3A",
                "ppi_protein_cluster1": "9606.ENSP00000355155",
                "id": "116443"
            }, {
    
                "gene_symbol": "SLC18B1",
                "ppi_protein_cluster1": "9606.ENSP00000275227",
                "id": "116843"
            }, {
    
                "gene_symbol": "CPNE4",
                "ppi_protein_cluster1": "9606.ENSP00000216775",
                "id": "131034"
            }, {
    
                "gene_symbol": "CAPSL",
                "ppi_protein_cluster1": "9606.ENSP00000380523",
                "id": "133690"
            }, {
    
                "gene_symbol": "CREB3L4",
                "ppi_protein_cluster1": "9606.ENSP00000271889",
                "id": "148327"
            }, {
    
                "gene_symbol": "EFHB",
                "ppi_protein_cluster1": "9606.ENSP00000295824",
                "id": "151651"
            }, {
                "gene_symbol": "DDC",
                "ppi_protein_cluster1": "9606.ENSP00000350616",
                "id": "1644"
            }, {
                "gene_symbol": "DRD1",
                "ppi_protein_cluster1": "9606.ENSP00000327652",
                "id": "1812"
            }, {
                "gene_symbol": "ARC",
                "ppi_protein_cluster1": "9606.ENSP00000349022",
                "id": "23237"
            }, {
                "gene_symbol": "DMXL2",
                "ppi_protein_cluster1": "9606.ENSP00000441858",
                "id": "23312"
            }, {
                "gene_symbol": "NUDCD3",
                "ppi_protein_cluster1": "9606.ENSP00000347626",
                "id": "23386"
            }, {
    
                "gene_symbol": "NALCN",
                "ppi_protein_cluster1": "9606.ENSP00000251127",
                "id": "259232"
            }, {
                "gene_symbol": "KANK2",
                "ppi_protein_cluster1": "9606.ENSP00000395650",
                "id": "25959"
            }, {
                "gene_symbol": "GRIA1",
                "ppi_protein_cluster1": "9606.ENSP00000264426",
                "id": "2890"
            }, {
                "gene_symbol": "GRIA2",
                "ppi_protein_cluster1": "9606.ENSP00000282499",
                "id": "2891"
            }, {
                "gene_symbol": "GRIA3",
                "ppi_protein_cluster1": "9606.ENSP00000264357",
                "id": "2892"
            }, {
                "gene_symbol": "GRIA4",
                "ppi_protein_cluster1": "9606.ENSP00000282499",
                "id": "2893"
            }, {
                "gene_symbol": "GRIN1",
                "ppi_protein_cluster1": "9606.ENSP00000360608",
                "id": "2902"
            }, {
                "gene_symbol": "GRIN2A",
                "ppi_protein_cluster1": "9606.ENSP00000332549",
                "id": "2903"
            }, {
                "gene_symbol": "GRIN2B",
                "ppi_protein_cluster1": "9606.ENSP00000279593",
                "id": "2904"
            }, {
                "gene_symbol": "GRIN2C",
                "ppi_protein_cluster1": "9606.ENSP00000293190",
                "id": "2905"
            }, {
                "gene_symbol": "PNMA3",
                "ppi_protein_cluster1": "9606.ENSP00000359286",
                "id": "29944"
            }, {
    
                "gene_symbol": "AATK-AS1",
                "ppi_protein_cluster1": null,
                "id": "388428"
            }, {
                "gene_symbol": "MAOA",
                "ppi_protein_cluster1": "9606.ENSP00000367309",
                "id": "4128"
            }, {
                "gene_symbol": "MAOB",
                "ppi_protein_cluster1": "9606.ENSP00000367309",
                "id": "4129"
            }, {
                "gene_symbol": "SSUH2",
                "ppi_protein_cluster1": "9606.ENSP00000324551",
                "id": "51066"
            }, {
                "gene_symbol": "PDYN",
                "ppi_protein_cluster1": "9606.ENSP00000217305",
                "id": "5173"
            }, {
                "gene_symbol": "CALML5",
                "ppi_protein_cluster1": "9606.ENSP00000369689",
                "id": "51806"
            }, {
                "gene_symbol": "PPP1CA",
                "ppi_protein_cluster1": "9606.ENSP00000326031",
                "id": "5499"
            }, {
                "gene_symbol": "PNMAL1",
                "ppi_protein_cluster1": "9606.ENSP00000318131",
                "id": "55228"
            }, {
                "gene_symbol": "PPP3CA",
                "ppi_protein_cluster1": "9606.ENSP00000378323",
                "id": "5530"
            }, {
                "gene_symbol": "PPP3CB",
                "ppi_protein_cluster1": "9606.ENSP00000378306",
                "id": "5532"
            }, {
                "gene_symbol": "PPP3R1",
                "ppi_protein_cluster1": "9606.ENSP00000340271",
                "id": "5534"
            }, {
                "gene_symbol": "PRKACA",
                "ppi_protein_cluster1": "9606.ENSP00000309591",
                "id": "5566"
            }, {
                "gene_symbol": "PRKACB",
                "ppi_protein_cluster1": "9606.ENSP00000359719",
                "id": "5567"
            }, {
                "gene_symbol": "PRKCA",
                "ppi_protein_cluster1": "9606.ENSP00000408695",
                "id": "5578"
            }, {
                "gene_symbol": "MCTP2",
                "ppi_protein_cluster1": "9606.ENSP00000350377",
                "id": "55784"
            }, {
                "gene_symbol": "PRKCB",
                "ppi_protein_cluster1": "9606.ENSP00000305355",
                "id": "5579"
            }, {
                "gene_symbol": "PRKCG",
                "ppi_protein_cluster1": "9606.ENSP00000263431",
                "id": "5582"
            }, {
                "gene_symbol": "PNMAL2",
                "ppi_protein_cluster1": "9606.ENSP00000473036",
                "id": "57469"
            }, {
                "gene_symbol": "DOCK6",
                "ppi_protein_cluster1": "9606.ENSP00000340742",
                "id": "57572"
            }, {
                "gene_symbol": "PVALB",
                "ppi_protein_cluster1": "9606.ENSP00000216200",
                "id": "5816"
            }, {
                "gene_symbol": "RTN1",
                "ppi_protein_cluster1": "9606.ENSP00000267484",
                "id": "6252"
            }, {
                "gene_symbol": "RTN2",
                "ppi_protein_cluster1": "9606.ENSP00000245923",
                "id": "6253"
            }, {
                "gene_symbol": "CREB3L2",
                "ppi_protein_cluster1": "9606.ENSP00000329140",
                "id": "64764"
            }, {
                "gene_symbol": "EFCAB6",
                "ppi_protein_cluster1": "9606.ENSP00000262726",
                "id": "64800"
            }, {
    
                "gene_symbol": "OCM",
                "ppi_protein_cluster1": "9606.ENSP00000242104",
                "id": "654231"
            }, {
                "gene_symbol": "SLC18A1",
                "ppi_protein_cluster1": "9606.ENSP00000276373",
                "id": "6570"
            }, {
                "gene_symbol": "STX1A",
                "ppi_protein_cluster1": "9606.ENSP00000222812",
                "id": "6804"
            }, {
                "gene_symbol": "CACNA1C",
                "ppi_protein_cluster1": "9606.ENSP00000266376",
                "id": "775"
            }, {
                "gene_symbol": "CACNA1D",
                "ppi_protein_cluster1": "9606.ENSP00000288139",
                "id": "776"
            }, {
                "gene_symbol": "EFCAB1",
                "ppi_protein_cluster1": "9606.ENSP00000262103",
                "id": "79645"
            }, {
                "gene_symbol": "CALM1",
                "ppi_protein_cluster1": "9606.ENSP00000291295",
                "id": "801"
            }, {
                "gene_symbol": "CALM2",
                "ppi_protein_cluster1": "9606.ENSP00000291295",
                "id": "805"
            }, {
                "gene_symbol": "CALM3",
                "ppi_protein_cluster1": "9606.ENSP00000272298",
                "id": "808"
            }, {
                "gene_symbol": "CAMK4",
                "ppi_protein_cluster1": "9606.ENSP00000282356",
                "id": "814"
            }, {
                "gene_symbol": "CAMK2A",
                "ppi_protein_cluster1": "9606.ENSP00000381412",
                "id": "815"
            }, {
                "gene_symbol": "CAMK2B",
                "ppi_protein_cluster1": "9606.ENSP00000379098",
                "id": "816"
            }, {
                "gene_symbol": "CAMK2D",
                "ppi_protein_cluster1": "9606.ENSP00000339740",
                "id": "817"
            }, {
                "gene_symbol": "CAMK2G",
                "ppi_protein_cluster1": "9606.ENSP00000319060",
                "id": "818"
            }, {
                "gene_symbol": "PPP1R1B",
                "ppi_protein_cluster1": "9606.ENSP00000322097",
                "id": "84152"
            }, {
                "gene_symbol": "EFCAB7",
                "ppi_protein_cluster1": "9606.ENSP00000360129",
                "id": "84455"
            }, {
                "gene_symbol": "CREB3L3",
                "ppi_protein_cluster1": null,
                "id": "84699"
            }, {
                "gene_symbol": "PNMA6A",
                "ppi_protein_cluster1": null,
                "id": "84968"
            }, {
                "gene_symbol": "CREB3L1",
                "ppi_protein_cluster1": "9606.ENSP00000434939",
                "id": "90993"
            }, {
                "gene_symbol": "CALML4",
                "ppi_protein_cluster1": "9606.ENSP00000419081",
                "id": "91860"
            }, {
                "gene_symbol": "PNMA1",
                "ppi_protein_cluster1": "9606.ENSP00000318914",
                "id": "9240"
            }, {
                "gene_symbol": "LENG9",
                "ppi_protein_cluster1": null,
                "id": "94059"
            }, {
                "gene_symbol": "CABP1",
                "ppi_protein_cluster1": "9606.ENSP00000317310",
                "id": "9478"
            }, {
                "gene_symbol": "CREB5",
                "ppi_protein_cluster1": "9606.ENSP00000350359",
                "id": "9586"
            }, {
                "gene_symbol": null,
                "ppi_protein_cluster1": "9606.ENSP00000364349",
                "id": "BGI_novel_G000696"
            }],
            "links": [{
                "score": 301,
                "source": "5578",
                "target": "5567"
            }, {
                "score": 302,
                "source": "5530",
                "target": "814"
            }, {
                "score": 308,
                "source": "4128",
                "target": "6570"
            }, {
                "score": 308,
                "source": "4129",
                "target": "6570"
            }, {
                "score": 308,
                "source": "5578",
                "target": "775"
            }, {
                "score": 309,
                "source": "2903",
                "target": "775"
            }, {
                "score": 311,
                "source": "808",
                "target": "5816"
            }, {
                "score": 311,
                "source": "815",
                "target": "5173"
            }, {
                "score": 313,
                "source": "5532",
                "target": "2902"
            }, {
                "score": 324,
                "source": "815",
                "target": "5530"
            }, {
                "score": 325,
                "source": "2903",
                "target": "814"
            }, {
                "score": 328,
                "source": "9478",
                "target": "5816"
            }, {
                "score": 330,
                "source": "776",
                "target": "2904"
            }, {
                "score": 342,
                "source": "6570",
                "target": "116843"
            }, {
                "score": 352,
                "source": "1812",
                "target": "6570"
            }, {
                "score": 357,
                "source": "2902",
                "target": "5173"
            }, {
                "score": 360,
                "source": "2903",
                "target": "5173"
            }, {
                "score": 361,
                "source": "25959",
                "target": "114824"
            }, {
                "score": 481,
                "source": "114824",
                "target": "25959"
            }, {
                "score": 362,
                "source": "23237",
                "target": "2903"
            }, {
                "score": 362,
                "source": "2904",
                "target": "775"
            }, {
                "score": 371,
                "source": "2902",
                "target": "23237"
            }, {
                "score": 372,
                "source": "814",
                "target": "775"
            }, {
                "score": 374,
                "source": "776",
                "target": "5582"
            }, {
                "score": 377,
                "source": "5530",
                "target": "5582"
            }, {
                "score": 377,
                "source": "5532",
                "target": "5582"
            }, {
                "score": 378,
                "source": "776",
                "target": "5816"
            }, {
                "score": 381,
                "source": "814",
                "target": "2904"
            }, {
                "score": 386,
                "source": "2903",
                "target": "808"
            }, {
                "score": 389,
                "source": "5530",
                "target": "2902"
            }, {
                "score": 390,
                "source": "4128",
                "target": "1812"
            }, {
                "score": 390,
                "source": "4129",
                "target": "1812"
            }, {
                "score": 391,
                "source": "57469",
                "target": "91860"
            }, {
                "score": 395,
                "source": "111",
                "target": "5532"
            }, {
                "score": 395,
                "source": "5566",
                "target": "808"
            }, {
                "score": 396,
                "source": "9240",
                "target": "55228"
            }, {
                "score": 403,
                "source": "111",
                "target": "5530"
            }, {
                "score": 410,
                "source": "2902",
                "target": "808"
            }, {
                "score": 410,
                "source": "5578",
                "target": "5532"
            }, {
                "score": 421,
                "source": "133690",
                "target": "64800"
            }, {
                "score": 421,
                "source": "133690",
                "target": "84455"
            }, {
                "score": 421,
                "source": "814",
                "target": "64800"
            }, {
                "score": 421,
                "source": "814",
                "target": "654231"
            }, {
                "score": 421,
                "source": "816",
                "target": "2891"
            }, {
                "score": 421,
                "source": "816",
                "target": "2893"
            }, {
                "score": 421,
                "source": "84455",
                "target": "814"
            }, {
                "score": 421,
                "source": "91860",
                "target": "133690"
            }, {
                "score": 421,
                "source": "91860",
                "target": "814"
            }, {
                "score": 421,
                "source": "9478",
                "target": "814"
            }, {
                "score": 425,
                "source": "2902",
                "target": "5582"
            }, {
                "score": 429,
                "source": "133690",
                "target": "5816"
            }, {
                "score": 430,
                "source": "808",
                "target": "5582"
            }, {
                "score": 431,
                "source": "5532",
                "target": "5579"
            }, {
                "score": 432,
                "source": "5567",
                "target": "808"
            }, {
                "score": 432,
                "source": "801",
                "target": "814"
            }, {
                "score": 432,
                "source": "805",
                "target": "814"
            }, {
                "score": 435,
                "source": "5579",
                "target": "808"
            }, {
                "score": 437,
                "source": "818",
                "target": "2892"
            }, {
                "score": 440,
                "source": "5582",
                "target": "5173"
            }, {
                "score": 446,
                "source": "5530",
                "target": "64800"
            }, {
                "score": 446,
                "source": "5530",
                "target": "84455"
            }, {
                "score": 446,
                "source": "5532",
                "target": "5816"
            }, {
                "score": 446,
                "source": "5532",
                "target": "64800"
            }, {
                "score": 446,
                "source": "5532",
                "target": "654231"
            }, {
                "score": 446,
                "source": "5532",
                "target": "84455"
            }, {
                "score": 446,
                "source": "5532",
                "target": "9478"
            }, {
                "score": 446,
                "source": "91860",
                "target": "5530"
            }, {
                "score": 446,
                "source": "91860",
                "target": "5532"
            }, {
                "score": 448,
                "source": "5530",
                "target": "9478"
            }, {
                "score": 452,
                "source": "817",
                "target": "2891"
            }, {
                "score": 452,
                "source": "817",
                "target": "2893"
            }, {
                "score": 454,
                "source": "23237",
                "target": "2904"
            }, {
                "score": 455,
                "source": "133690",
                "target": "654231"
            }, {
                "score": 457,
                "source": "5530",
                "target": "5579"
            }, {
                "score": 458,
                "source": "2905",
                "target": "5816"
            }, {
                "score": 458,
                "source": "5530",
                "target": "654231"
            }, {
                "score": 462,
                "source": "816",
                "target": "2892"
            }, {
                "score": 467,
                "source": "2902",
                "target": "5816"
            }, {
                "score": 472,
                "source": "2904",
                "target": "5173"
            }, {
                "score": 474,
                "source": "775",
                "target": "6804"
            }, {
                "score": 474,
                "source": "817",
                "target": "2892"
            }, {
                "score": 478,
                "source": "5578",
                "target": "808"
            }, {
                "score": 482,
                "source": "814",
                "target": "5816"
            }, {
                "score": 486,
                "source": "5532",
                "target": "801"
            }, {
                "score": 486,
                "source": "5532",
                "target": "805"
            }, {
                "score": 493,
                "source": "2902",
                "target": "5579"
            }, {
                "score": 495,
                "source": "2904",
                "target": "808"
            }, {
                "score": 495,
                "source": "5530",
                "target": "801"
            }, {
                "score": 495,
                "source": "5530",
                "target": "805"
            }, {
                "score": 499,
                "source": "2890",
                "target": "5816"
            }, {
                "score": 501,
                "source": "776",
                "target": "808"
            }, {
                "score": 510,
                "source": "2891",
                "target": "5816"
            }, {
                "score": 510,
                "source": "2893",
                "target": "5816"
            }, {
                "score": 511,
                "source": "133690",
                "target": "151651"
            }, {
                "score": 513,
                "source": "5173",
                "target": "5816"
            }, {
                "score": 515,
                "source": "5532",
                "target": "808"
            }, {
                "score": 519,
                "source": "5530",
                "target": "5816"
            }, {
                "score": 521,
                "source": "2904",
                "target": "5816"
            }, {
                "score": 535,
                "source": "1644",
                "target": "6570"
            }, {
                "score": 536,
                "source": "1812",
                "target": "2892"
            }, {
                "score": 538,
                "source": "1812",
                "target": "2891"
            }, {
                "score": 538,
                "source": "1812",
                "target": "2893"
            }, {
                "score": 539,
                "source": "5532",
                "target": "5566"
            }, {
                "score": 539,
                "source": "9240",
                "target": "5582"
            }, {
                "score": 540,
                "source": "5530",
                "target": "5566"
            }, {
                "score": 545,
                "source": "5530",
                "target": "5567"
            }, {
                "score": 557,
                "source": "133690",
                "target": "9478"
            }, {
                "score": 558,
                "source": "1812",
                "target": "2890"
            }, {
                "score": 559,
                "source": "1812",
                "target": "2905"
            }, {
                "score": 574,
                "source": "9478",
                "target": "776"
            }, {
                "score": 576,
                "source": "1644",
                "target": "1812"
            }, {
                "score": 579,
                "source": "2903",
                "target": "5816"
            }, {
                "score": 579,
                "source": "5532",
                "target": "5567"
            }, {
                "score": 583,
                "source": "5578",
                "target": "5530"
            }, {
                "score": 594,
                "source": "818",
                "target": "808"
            }, {
                "score": 602,
                "source": "2891",
                "target": "5582"
            }, {
                "score": 602,
                "source": "2893",
                "target": "5582"
            }, {
                "score": 608,
                "source": "5499",
                "target": "5579"
            }, {
                "score": 614,
                "source": "5578",
                "target": "2891"
            }, {
                "score": 614,
                "source": "5578",
                "target": "2893"
            }, {
                "score": 621,
                "source": "2904",
                "target": "5582"
            }, {
                "score": 623,
                "source": "5530",
                "target": "808"
            }, {
                "score": 627,
                "source": "5579",
                "target": "2904"
            }, {
                "score": 659,
                "source": "116443",
                "target": "2905"
            }, {
                "score": 668,
                "source": "5578",
                "target": "2890"
            }, {
                "score": 671,
                "source": "815",
                "target": "2892"
            }, {
                "score": 681,
                "source": "2905",
                "target": "2892"
            }, {
                "score": 689,
                "source": "2905",
                "target": "2890"
            }, {
                "score": 692,
                "source": "2905",
                "target": "2891"
            }, {
                "score": 692,
                "source": "2905",
                "target": "2893"
            }, {
                "score": 711,
                "source": "2903",
                "target": "1812"
            }, {
                "score": 724,
                "source": "2891",
                "target": "2890"
            }, {
                "score": 724,
                "source": "2891",
                "target": "2892"
            }, {
                "score": 724,
                "source": "2893",
                "target": "2890"
            }, {
                "score": 724,
                "source": "2893",
                "target": "2892"
            }, {
                "score": 734,
                "source": "814",
                "target": "808"
            }, {
                "score": 736,
                "source": "818",
                "target": "2891"
            }, {
                "score": 736,
                "source": "818",
                "target": "2893"
            }, {
                "score": 740,
                "source": "5578",
                "target": "2902"
            }, {
                "score": 762,
                "source": "10313",
                "target": "6252"
            }, {
                "score": 776,
                "source": "815",
                "target": "808"
            }, {
                "score": 779,
                "source": "2902",
                "target": "1812"
            }, {
                "score": 781,
                "source": "116443",
                "target": "2892"
            }, {
                "score": 786,
                "source": "116443",
                "target": "2890"
            }, {
                "score": 787,
                "source": "815",
                "target": "2891"
            }, {
                "score": 787,
                "source": "815",
                "target": "2893"
            }, {
                "score": 796,
                "source": "116443",
                "target": "2891"
            }, {
                "score": 796,
                "source": "116443",
                "target": "2893"
            }, {
                "score": 800,
                "source": "116443",
                "target": "5566"
            }, {
                "score": 800,
                "source": "148327",
                "target": "5582"
            }, {
                "score": 800,
                "source": "5499",
                "target": "148327"
            }, {
                "score": 800,
                "source": "5499",
                "target": "2891"
            }, {
                "score": 800,
                "source": "5499",
                "target": "2892"
            }, {
                "score": 800,
                "source": "5499",
                "target": "2893"
            }, {
                "score": 800,
                "source": "5499",
                "target": "775"
            }, {
                "score": 800,
                "source": "5499",
                "target": "776"
            }, {
                "score": 800,
                "source": "5499",
                "target": "84699"
            }, {
                "score": 800,
                "source": "5567",
                "target": "116443"
            }, {
                "score": 800,
                "source": "5578",
                "target": "148327"
            }, {
                "score": 800,
                "source": "5578",
                "target": "84699"
            }, {
                "score": 800,
                "source": "5579",
                "target": "148327"
            }, {
                "score": 800,
                "source": "5579",
                "target": "84699"
            }, {
                "score": 800,
                "source": "5582",
                "target": "84699"
            }, {
                "score": 800,
                "source": "64764",
                "target": "5499"
            }, {
                "score": 800,
                "source": "64764",
                "target": "5582"
            }, {
                "score": 800,
                "source": "64764",
                "target": "814"
            }, {
                "score": 800,
                "source": "64764",
                "target": "818"
            }, {
                "score": 800,
                "source": "814",
                "target": "84699"
            }, {
                "score": 800,
                "source": "815",
                "target": "148327"
            }, {
                "score": 800,
                "source": "815",
                "target": "64764"
            }, {
                "score": 800,
                "source": "815",
                "target": "84699"
            }, {
                "score": 800,
                "source": "816",
                "target": "148327"
            }, {
                "score": 800,
                "source": "816",
                "target": "64764"
            }, {
                "score": 800,
                "source": "816",
                "target": "84699"
            }, {
                "score": 800,
                "source": "817",
                "target": "148327"
            }, {
                "score": 800,
                "source": "817",
                "target": "64764"
            }, {
                "score": 800,
                "source": "817",
                "target": "84699"
            }, {
                "score": 800,
                "source": "818",
                "target": "148327"
            }, {
                "score": 800,
                "source": "818",
                "target": "84699"
            }, {
                "score": 800,
                "source": "90993",
                "target": "5499"
            }, {
                "score": 800,
                "source": "90993",
                "target": "5578"
            }, {
                "score": 800,
                "source": "90993",
                "target": "5579"
            }, {
                "score": 800,
                "source": "90993",
                "target": "5582"
            }, {
                "score": 800,
                "source": "90993",
                "target": "814"
            }, {
                "score": 800,
                "source": "90993",
                "target": "815"
            }, {
                "score": 800,
                "source": "90993",
                "target": "816"
            }, {
                "score": 800,
                "source": "90993",
                "target": "817"
            }, {
                "score": 800,
                "source": "90993",
                "target": "818"
            }, {
                "score": 800,
                "source": "9586",
                "target": "5499"
            }, {
                "score": 802,
                "source": "2902",
                "target": "2892"
            }, {
                "score": 802,
                "source": "814",
                "target": "148327"
            }, {
                "score": 804,
                "source": "817",
                "target": "5499"
            }, {
                "score": 805,
                "source": "116443",
                "target": "5499"
            }, {
                "score": 805,
                "source": "2902",
                "target": "5499"
            }, {
                "score": 805,
                "source": "51806",
                "target": "5499"
            }, {
                "score": 806,
                "source": "51806",
                "target": "2902"
            }, {
                "score": 806,
                "source": "51806",
                "target": "2903"
            }, {
                "score": 806,
                "source": "51806",
                "target": "2904"
            }, {
                "score": 806,
                "source": "51806",
                "target": "2905"
            }, {
                "score": 806,
                "source": "5499",
                "target": "2890"
            }, {
                "score": 806,
                "source": "5578",
                "target": "64764"
            }, {
                "score": 807,
                "source": "2902",
                "target": "2890"
            }, {
                "score": 807,
                "source": "5499",
                "target": "818"
            }, {
                "score": 807,
                "source": "5566",
                "target": "2890"
            }, {
                "score": 807,
                "source": "5566",
                "target": "2892"
            }, {
                "score": 807,
                "source": "5567",
                "target": "2890"
            }, {
                "score": 807,
                "source": "5567",
                "target": "2891"
            }, {
                "score": 807,
                "source": "5567",
                "target": "2893"
            }, {
                "score": 809,
                "source": "2903",
                "target": "2892"
            }, {
                "score": 809,
                "source": "2904",
                "target": "2892"
            }, {
                "score": 809,
                "source": "5532",
                "target": "776"
            }, {
                "score": 809,
                "source": "818",
                "target": "776"
            }, {
                "score": 810,
                "source": "111",
                "target": "51806"
            }, {
                "score": 810,
                "source": "51806",
                "target": "817"
            }, {
                "score": 810,
                "source": "51806",
                "target": "818"
            }, {
                "score": 810,
                "source": "5499",
                "target": "2905"
            }, {
                "score": 810,
                "source": "815",
                "target": "51806"
            }, {
                "score": 810,
                "source": "815",
                "target": "776"
            }, {
                "score": 810,
                "source": "816",
                "target": "51806"
            }, {
                "score": 810,
                "source": "9586",
                "target": "814"
            }, {
                "score": 811,
                "source": "2902",
                "target": "2891"
            }, {
                "score": 811,
                "source": "2902",
                "target": "2893"
            }, {
                "score": 811,
                "source": "815",
                "target": "5499"
            }, {
                "score": 812,
                "source": "5566",
                "target": "84699"
            }, {
                "score": 812,
                "source": "5567",
                "target": "84699"
            }, {
                "score": 812,
                "source": "816",
                "target": "776"
            }, {
                "score": 813,
                "source": "2903",
                "target": "5499"
            }, {
                "score": 813,
                "source": "5566",
                "target": "776"
            }, {
                "score": 813,
                "source": "5567",
                "target": "776"
            }, {
                "score": 814,
                "source": "817",
                "target": "776"
            }, {
                "score": 815,
                "source": "5567",
                "target": "775"
            }, {
                "score": 815,
                "source": "816",
                "target": "5499"
            }, {
                "score": 816,
                "source": "2891",
                "target": "2904"
            }, {
                "score": 816,
                "source": "2893",
                "target": "2904"
            }, {
                "score": 817,
                "source": "5532",
                "target": "775"
            }, {
                "score": 817,
                "source": "5567",
                "target": "2892"
            }, {
                "score": 817,
                "source": "815",
                "target": "9586"
            }, {
                "score": 817,
                "source": "816",
                "target": "9586"
            }, {
                "score": 817,
                "source": "9586",
                "target": "817"
            }, {
                "score": 817,
                "source": "9586",
                "target": "818"
            }, {
                "score": 818,
                "source": "2903",
                "target": "2890"
            }, {
                "score": 818,
                "source": "5566",
                "target": "148327"
            }, {
                "score": 819,
                "source": "5566",
                "target": "2905"
            }, {
                "score": 819,
                "source": "5567",
                "target": "2905"
            }, {
                "score": 821,
                "source": "2903",
                "target": "5566"
            }, {
                "score": 821,
                "source": "51806",
                "target": "775"
            }, {
                "score": 821,
                "source": "90993",
                "target": "5566"
            }, {
                "score": 821,
                "source": "90993",
                "target": "5567"
            }, {
                "score": 822,
                "source": "2902",
                "target": "5567"
            }, {
                "score": 822,
                "source": "2903",
                "target": "2891"
            }, {
                "score": 822,
                "source": "2903",
                "target": "2893"
            }, {
                "score": 822,
                "source": "5567",
                "target": "148327"
            }, {
                "score": 825,
                "source": "2904",
                "target": "2890"
            }, {
                "score": 825,
                "source": "51806",
                "target": "776"
            }, {
                "score": 825,
                "source": "5530",
                "target": "776"
            }, {
                "score": 829,
                "source": "5566",
                "target": "2904"
            }, {
                "score": 831,
                "source": "2902",
                "target": "5566"
            }, {
                "score": 831,
                "source": "64764",
                "target": "5566"
            }, {
                "score": 834,
                "source": "5567",
                "target": "64764"
            }, {
                "score": 838,
                "source": "5578",
                "target": "9586"
            }, {
                "score": 838,
                "source": "64764",
                "target": "5579"
            }, {
                "score": 838,
                "source": "776",
                "target": "6804"
            }, {
                "score": 838,
                "source": "9586",
                "target": "5579"
            }, {
                "score": 838,
                "source": "9586",
                "target": "5582"
            }, {
                "score": 842,
                "source": "816",
                "target": "808"
            }, {
                "score": 843,
                "source": "111",
                "target": "5579"
            }, {
                "score": 843,
                "source": "816",
                "target": "775"
            }, {
                "score": 844,
                "source": "111",
                "target": "5582"
            }, {
                "score": 849,
                "source": "5578",
                "target": "2903"
            }, {
                "score": 850,
                "source": "5567",
                "target": "9586"
            }, {
                "score": 850,
                "source": "818",
                "target": "775"
            }, {
                "score": 850,
                "source": "9586",
                "target": "5566"
            }, {
                "score": 853,
                "source": "5567",
                "target": "2904"
            }, {
                "score": 854,
                "source": "1812",
                "target": "2904"
            }, {
                "score": 857,
                "source": "5578",
                "target": "5566"
            }, {
                "score": 857,
                "source": "817",
                "target": "775"
            }, {
                "score": 858,
                "source": "1812",
                "target": "5173"
            }, {
                "score": 858,
                "source": "5567",
                "target": "2903"
            }, {
                "score": 859,
                "source": "5530",
                "target": "775"
            }, {
                "score": 863,
                "source": "815",
                "target": "775"
            }, {
                "score": 879,
                "source": "51806",
                "target": "814"
            }, {
                "score": 879,
                "source": "817",
                "target": "2890"
            }, {
                "score": 879,
                "source": "818",
                "target": "2890"
            }, {
                "score": 884,
                "source": "5530",
                "target": "51806"
            }, {
                "score": 884,
                "source": "5532",
                "target": "51806"
            }, {
                "score": 891,
                "source": "90993",
                "target": "84699"
            }, {
                "score": 897,
                "source": "816",
                "target": "2890"
            }, {
                "score": 901,
                "source": "5530",
                "target": "5532"
            }, {
                "score": 901,
                "source": "5578",
                "target": "5579"
            }, {
                "score": 901,
                "source": "5578",
                "target": "5582"
            }, {
                "score": 901,
                "source": "5579",
                "target": "5582"
            }, {
                "score": 901,
                "source": "801",
                "target": "808"
            }, {
                "score": 901,
                "source": "805",
                "target": "808"
            }, {
                "score": 903,
                "source": "776",
                "target": "775"
            }, {
                "score": 903,
                "source": "815",
                "target": "818"
            }, {
                "score": 905,
                "source": "816",
                "target": "814"
            }, {
                "score": 911,
                "source": "2905",
                "target": "2904"
            }, {
                "score": 911,
                "source": "5578",
                "target": "2904"
            }, {
                "score": 912,
                "source": "5566",
                "target": "2891"
            }, {
                "score": 912,
                "source": "5566",
                "target": "2893"
            }, {
                "score": 913,
                "source": "111",
                "target": "5173"
            }, {
                "score": 913,
                "source": "2903",
                "target": "2905"
            }, {
                "score": 913,
                "source": "815",
                "target": "2890"
            }, {
                "score": 915,
                "source": "5499",
                "target": "5566"
            }, {
                "score": 917,
                "source": "5532",
                "target": "5499"
            }, {
                "score": 917,
                "source": "816",
                "target": "5532"
            }, {
                "score": 918,
                "source": "5530",
                "target": "5499"
            }, {
                "score": 918,
                "source": "5567",
                "target": "5499"
            }, {
                "score": 921,
                "source": "5566",
                "target": "775"
            }, {
                "score": 923,
                "source": "111",
                "target": "1812"
            }, {
                "score": 923,
                "source": "816",
                "target": "5530"
            }, {
                "score": 936,
                "source": "817",
                "target": "2905"
            }, {
                "score": 942,
                "source": "815",
                "target": "816"
            }, {
                "score": 943,
                "source": "815",
                "target": "2905"
            }, {
                "score": 946,
                "source": "2890",
                "target": "2892"
            }, {
                "score": 946,
                "source": "2902",
                "target": "2905"
            }, {
                "score": 948,
                "source": "816",
                "target": "2905"
            }, {
                "score": 948,
                "source": "818",
                "target": "2905"
            }, {
                "score": 949,
                "source": "111",
                "target": "5578"
            }, {
                "score": 951,
                "source": "2902",
                "target": "817"
            }, {
                "score": 953,
                "source": "111",
                "target": "5567"
            }, {
                "score": 955,
                "source": "816",
                "target": "818"
            }, {
                "score": 957,
                "source": "817",
                "target": "818"
            }, {
                "score": 961,
                "source": "817",
                "target": "2903"
            }, {
                "score": 961,
                "source": "817",
                "target": "808"
            }, {
                "score": 962,
                "source": "5499",
                "target": "2904"
            }, {
                "score": 963,
                "source": "4128",
                "target": "1644"
            }, {
                "score": 963,
                "source": "4129",
                "target": "1644"
            }, {
                "score": 966,
                "source": "116443",
                "target": "2903"
            }, {
                "score": 966,
                "source": "116443",
                "target": "2904"
            }, {
                "score": 972,
                "source": "2903",
                "target": "2904"
            }, {
                "score": 973,
                "source": "816",
                "target": "2902"
            }, {
                "score": 974,
                "source": "815",
                "target": "817"
            }, {
                "score": 980,
                "source": "111",
                "target": "5566"
            }, {
                "score": 980,
                "source": "815",
                "target": "2903"
            }, {
                "score": 980,
                "source": "816",
                "target": "817"
            }, {
                "score": 981,
                "source": "817",
                "target": "2904"
            }, {
                "score": 982,
                "source": "815",
                "target": "2902"
            }, {
                "score": 983,
                "source": "2903",
                "target": "818"
            }, {
                "score": 984,
                "source": "2902",
                "target": "116443"
            }, {
                "score": 985,
                "source": "9478",
                "target": "775"
            }, {
                "score": 987,
                "source": "2902",
                "target": "818"
            }, {
                "score": 988,
                "source": "808",
                "target": "775"
            }, {
                "score": 990,
                "source": "816",
                "target": "2904"
            }, {
                "score": 992,
                "source": "816",
                "target": "2903"
            }, {
                "score": 996,
                "source": "818",
                "target": "2904"
            }, {
                "score": 997,
                "source": "5567",
                "target": "5566"
            }, {
                "score": 997,
                "source": "815",
                "target": "2904"
            }, {
                "score": 999,
                "source": "2902",
                "target": "2903"
            }, {
                "score": 999,
                "source": "2902",
                "target": "2904"
            }]
    
        }
        this.drawChart(data);
    }

    drawChart(data) {
        d3.select("#netSvg").selectAll("g").remove();
        d3.select("#netSvg").selectAll("defs").remove();

        let that = this;
        const width = 960, height = 800;
        const svg = d3.select("svg#netSvg").attr("width", width).attr("height", height);

        let nodeColors = ["#0000ff", "#ff0000"];
        let nodeRadius = [3, 10];
        let lineColors = ["#ccc", "#000"];

        let nodes = data.nodes;
        let links = data.links;
        let arrows = [{ id: 'end-arrow', opacity: 1 }, { id: 'end-arrow-fade', opacity: 0.1 }];

        //node连接数
        for (let i = 0; i < nodes.length; i++) {
            let count = 0;
            if (links.length) {
                for (let j = 0; j < links.length; j++) {
                    if ((typeof links[j].source === "string") && (typeof links[j].target === "string")) {
                        if ((nodes[i].id === links[j].source) || (nodes[i].id === links[j].target)) {
                            count++;
                        }
                    } else {
                        if ((nodes[i].id === links[j].source.id) || (nodes[i].id === links[j].target.id)) {
                            count++;
                        }
                    }
                }
            }
            nodes[i].value = count;
            nodes[i].selected = false;
        }

        let maxValue = d3.max(nodes, d => d.value);

        //箭头
        svg.append("defs").selectAll("marker")
            .data(arrows).enter()
            .append("marker")
            .attr("id", d => d.id)
            .attr("viewBox", '0 0 10 10')
            .attr("refX", 20)
            .attr("refY", 5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", 'M0,0 L0,10 L10,5 z')
            .attr("opacity", d => d.opacity);

        //比例尺
        let nodeColorScale = d3.scaleLinear().domain([0, maxValue]).range(nodeColors).interpolate(d3.interpolateRgb);
        let radiuScale = d3.scaleLinear().domain([0, maxValue]).range(nodeRadius).clamp(true);
        let linkColorScale = d3.scaleLinear().domain([150, 1000]).range(lineColors).interpolate(d3.interpolateRgb);

        //创建一个力导向图的模拟器
        const simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id)) //基于它们之间的链接将节点拉到一起
            .force('charge', d3.forceManyBody().strength(-this.force)) //将节点分开以将它们分隔开
            .force("collide", d3.forceCollide().radius(d => radiuScale(d.value)))  // 添加一些碰撞检测，使它们不重叠。
            .force('center', d3.forceCenter(width / 2, height / 2)) //把它们画在空间的中心
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        // add link
        let link = svg.append("g")
            .attr("class", "links")
            .selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", d => linkColorScale(d.score))
            .attr("marker-end", 'url(#end-arrow)');

        //add brush
        let brush = svg.append("g").attr("class", "brush")
            .call(d3.brush()
                .extent([[0, 0], [width, height]])
                .on("start", brushStart)
                .on("brush", brushed)
                .on("end", brushEnd)
            );

        //add node
        let node = svg.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", d => radiuScale(d.value))
            .attr("fill", d => nodeColorScale(d.value))
            .on("mouseover", mouseOver(0.4))
            .on("mouseout", mouseOut)
            .on("click", function (d) {
                d3.event.stopPropagation();

                if (!that.isMultiSelect) {   // 单选
                    that.selectedNodes = [];
                    d3.select("#netSvg").selectAll(".node").classed("selected", false);
                    d3.select(this).classed("selected", true);
                    nodes.forEach(m => {
                        m.selected = false;
                    });
                    d.selected = true;
                    if (d.selected) {
                        that.selectedNodes.push(d);
                    }
                    console.log(that.selectedNodes);
                } else {  // 多选
                    d3.select(this).classed("selected", true);
                    d.selected = true;
                    if (d.selected) {
                        that.selectedNodes.push(d);
                    }
                }
            })
            .call(d3.drag()
                .on("start", dragStart)
                .on("drag", dragged)
                .on("end", dragEnd));

        //add nodes to simulation
        simulation.nodes(nodes).on("tick", ticked);
        //add links to simulation
        simulation.force("link").links(links); // .distance([10])：设置node距离

        function ticked() {
            link.attr("d", linkPos);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        }

        //通过中间节点，绘制节点之间的曲线路径
        function linkPos(d) {
            console.log(d)
            let offset = 5;

            //中间点
            let midPoint_x = (d.source.x + d.target.x) / 2;
            let midPoint_y = (d.source.y + d.target.y) / 2;

            //两点x、y方向距离
            let dx = d.target.x - d.source.x;
            let dy = d.target.y - d.source.y;

            //两点直线距离
            let node_dis = Math.sqrt(dx * dx + dy * dy);

            let offsetX = midPoint_x + offset * (dy / node_dis);
            let offsetY = midPoint_y - offset * (dx / node_dis);

            return "M" + d.source.x + "," + d.source.y +
                "S" + offsetX + "," + offsetY +
                " " + d.target.x + "," + d.target.y;
        }

        //节点的链接
        let linkedByIndex = {};
        links.forEach(d => {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });

        //节点是否链接
        function isConnected(a, b) {
            return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index === b.index;
        }

        //node hover
        function mouseOver(opacity) {
            return d => {
                node.attr("fill-opacity", m => {
                    let curOpacity = isConnected(d, m) ? 1 : opacity;
                    return curOpacity;
                });

                node.attr("stroke-opacity", m => {
                    let curOpacity = isConnected(d, m) ? 1 : opacity;
                    return curOpacity;
                });

                link.attr("stroke-opacity", m => (m.source === d || m.target === d ? 1 : opacity));

                link.attr("stroke-width", m => (m.source === d || m.target === d ? 2 : 1));

                link.attr('marker-end', m => (m.source === d || m.target === d ? 'url(#end-arrow)' : 'url(#end-arrow-fade)'));
            }
        }

        function mouseOut() {
            node.attr("fill-opacity", 1);
            node.attr("stroke-opacity", 1);
            link.attr("stroke-opacity", 1);
            link.attr("stroke-width", 1);
            link.attr('marker-end', 'url(#end-arrow)');
        }

        //node 拖拽
        function dragStart(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragEnd(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // node 拖选
        function brushStart() {
            if (d3.event.sourceEvent.type != "end") {
                node.classed("selected", d => d.selected);
            }
        }

        function brushed() {
            if (d3.event.sourceEvent.type != "end") {
                let selection = d3.event.selection;
                if (that.isMultiSelect) {
                    node.classed("selected", d => {
                        return (selection != null
                            && selection[0][0] <= d.x && d.x <= selection[1][0]
                            && selection[0][1] <= d.y && d.y <= selection[1][1]) || d.selected;
                    })
                } else {
                    node.classed("selected", d => {
                        return (selection != null
                            && selection[0][0] <= d.x && d.x <= selection[1][0]
                            && selection[0][1] <= d.y && d.y <= selection[1][1]);
                    })
                }
            }
        }

        function brushEnd() {
            let selection = d3.event.selection;
            if (selection != null) {
                d3.select(this).call(d3.event.target.move, null);
                console.log(d3.select(".nodes").selectAll(".node.selected").nodes());
            }
        }

    }

    //点击“单选”
    single() {
        this.isMultiSelect = false;
        //清空选中的node
        d3.select("#netSvg").selectAll("circle.node").classed("selected", false);
        this.selectedNodes = [];

    }

    //点击“多选”
    multiple() {
        this.isMultiSelect = true;
        //清空选中的node
        d3.select("#netSvg").selectAll("circle.node").classed("selected", false);
        this.selectedNodes = [];
    }

    //点击“确定”
    comfirm() {
        console.log(this.selectedNodes);
    }
}
